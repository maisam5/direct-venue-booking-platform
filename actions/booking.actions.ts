"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  bookingSchema,
  BookingFormValues,
} from "@/lib/validations/bookingSchema";
import {
  sendBookingStatusUpdateEmail,
  sendNewBookingEmails,
} from "@/lib/email/resend";
import { mapPrismaBookingToUi, toIsoDateString } from "@/lib/format";
import { BookingRequest } from "@/types";
import { AuthError, getSession, requireUser, errorMessage } from "@/lib/auth";
import { isHostRole } from "@/lib/roles";

export async function getBookingsAction(): Promise<BookingRequest[]> {
  const session = await getSession();
  if (!session) {
    return [];
  }

  const whereClause =
    session.role === "ADMIN"
      ? undefined
      : isHostRole(session.role)
      ? {
          OR: [
            { listing: { ownerId: session.dbUserId } },
            { plannerId: session.dbUserId },
          ],
        }
      : { plannerId: session.dbUserId };

  const records = await prisma.booking.findMany({
    where: whereClause,
    include: {
      listing: {
        select: { id: true, slug: true, title: true, city: true },
      },
      planner: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      package: {
        select: { id: true, name: true, price: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return records.map(mapPrismaBookingToUi);
}

export async function createDirectBooking(
  rawInput: BookingFormValues & { calculatedTotal?: number }
): Promise<{
  success: boolean;
  booking?: BookingRequest;
  error?: string;
  requiresAuth?: boolean;
}> {
  let session;
  try {
    session = await requireUser();
  } catch (err) {
    return {
      success: false,
      requiresAuth: true,
      error: errorMessage(err, "Please sign in with Google to book a venue or vendor."),
    };
  }

  const parsed = bookingSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid booking payload",
    };
  }

  const values = parsed.data;
  const eventDateObj = new Date(`${values.eventDate}T00:00:00.000Z`);
  if (Number.isNaN(eventDateObj.getTime())) {
    return {
      success: false,
      error: "Invalid event date format. Please use YYYY-MM-DD.",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify listing + owner + packages
      const listing = await tx.listing.findUnique({
        where: { id: values.listingId },
        include: {
          owner: true,
          packages: true,
        },
      });

      if (!listing) {
        throw new Error("Selected venue or vendor listing no longer exists.");
      }

      // 2. Concurrency-safe check on AvailabilitySlot for (listingId, eventDate)
      const existingSlot = await tx.availabilitySlot.findUnique({
        where: {
          listingId_date: {
            listingId: listing.id,
            date: eventDateObj,
          },
        },
      });

      if (
        existingSlot &&
        (existingSlot.status === "BOOKED" || existingSlot.status === "BLOCKED")
      ) {
        throw new Error("This date was just reserved or blocked by the owner");
      }

      // 3. Update authenticated planner's contact info
      const planner = await tx.user.update({
        where: { id: session.dbUserId },
        data: {
          fullName: values.plannerName || session.fullName,
          phone: values.plannerPhone,
        },
      });

      // 4. Calculate direct total (0% broker fee)
      const selectedPkg =
        listing.packages.find((p) => p.id === values.packageId) ??
        listing.packages[0] ??
        null;

      const baseAmount = selectedPkg
        ? listing.pricingUnit === "PER_HEAD"
          ? selectedPkg.price * values.guestCount
          : selectedPkg.price
        : listing.basePrice;

      const totalAmount =
        typeof rawInput.calculatedTotal === "number" &&
        rawInput.calculatedTotal >= baseAmount
          ? rawInput.calculatedTotal
          : baseAmount;

      const bookingCode = `MGE-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 5. Create Booking record linked to authenticated planner
      const createdBooking = await tx.booking.create({
        data: {
          bookingCode,
          listingId: listing.id,
          plannerId: planner.id,
          packageId: selectedPkg ? selectedPkg.id : null,
          eventDate: eventDateObj,
          eventType: values.eventCategory.toUpperCase(),
          guestCount: values.guestCount,
          totalAmount,
          status: "PENDING",
          plannerNotes:
            values.notes ||
            `Direct booking request sent to ${listing.owner.fullName}.`,
        },
        include: {
          listing: {
            select: { id: true, slug: true, title: true, city: true },
          },
          planner: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          package: {
            select: { id: true, name: true, price: true },
          },
        },
      });

      // 6. Atomically upsert AvailabilitySlot to BOOKED linked to bookingId
      await tx.availabilitySlot.upsert({
        where: {
          listingId_date: {
            listingId: listing.id,
            date: eventDateObj,
          },
        },
        update: {
          status: "BOOKED",
          bookingId: createdBooking.id,
          note: `${values.eventCategory} · ${values.plannerName}`,
        },
        create: {
          listingId: listing.id,
          date: eventDateObj,
          status: "BOOKED",
          bookingId: createdBooking.id,
          note: `${values.eventCategory} · ${values.plannerName}`,
        },
      });

      return {
        createdBooking,
        listing,
        selectedPkgName: selectedPkg?.name || "Direct Owner Package",
      };
    });

    // 7. Dispatch Resend transactional emails to Planner & Owner
    const dateStr = toIsoDateString(result.createdBooking.eventDate);
    await sendNewBookingEmails({
      plannerEmail: values.plannerEmail,
      ownerEmail: result.listing.owner.email,
      plannerPayload: {
        bookingCode: result.createdBooking.bookingCode,
        plannerName: values.plannerName,
        listingTitle: result.listing.title,
        listingCity: result.listing.city,
        listingAddress: result.listing.address,
        eventDate: dateStr,
        eventType: values.eventCategory,
        guestCount: values.guestCount,
        packageName: result.selectedPkgName,
        totalAmount: result.createdBooking.totalAmount,
        ownerName: result.listing.owner.fullName,
        ownerEmail: result.listing.owner.email,
        ownerPhone: result.listing.owner.phone || "+1 (212) 555-0118",
      },
      ownerPayload: {
        bookingCode: result.createdBooking.bookingCode,
        ownerName: result.listing.owner.fullName,
        listingTitle: result.listing.title,
        plannerName: values.plannerName,
        plannerEmail: values.plannerEmail,
        plannerPhone: values.plannerPhone,
        eventDate: dateStr,
        eventType: values.eventCategory,
        guestCount: values.guestCount,
        packageName: result.selectedPkgName,
        totalAmount: result.createdBooking.totalAmount,
        plannerNotes: values.notes,
      },
    });

    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath(`/listings/${result.listing.slug}`);
    revalidatePath("/dashboard/user");
    revalidatePath("/dashboard/owner");

    return {
      success: true,
      booking: mapPrismaBookingToUi(result.createdBooking),
    };
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Unable to complete booking transaction"),
    };
  }
}

export async function updateBookingStatusAction(params: {
  bookingId: string;
  newStatus: "CONFIRMED" | "DECLINED" | "CANCELLED" | "PENDING";
  ownerResponseNote?: string;
}): Promise<{
  success: boolean;
  booking?: BookingRequest;
  error?: string;
}> {
  try {
    const session = await requireUser();

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findUnique({
        where: { id: params.bookingId },
        include: {
          listing: { include: { owner: true } },
          planner: true,
          package: true,
        },
      });

      if (!existing) {
        throw new Error("Booking record not found");
      }

      const isOwner = existing.listing.ownerId === session.dbUserId;
      const isPlanner = existing.plannerId === session.dbUserId;
      const isAdmin = session.role === "ADMIN";

      if (params.newStatus === "CANCELLED") {
        if (!isPlanner && !isOwner && !isAdmin) {
          throw new AuthError(
            "Unauthorized: Only the booking planner or listing owner can cancel.",
            "FORBIDDEN"
          );
        }
      } else if (!isOwner && !isAdmin) {
        throw new AuthError(
          "Unauthorized: Only the listing owner can confirm or decline bookings.",
          "FORBIDDEN"
        );
      }

      const bookingRecord = await tx.booking.update({
        where: { id: existing.id },
        data: {
          status: params.newStatus,
          ownerResponseNote:
            params.ownerResponseNote ?? existing.ownerResponseNote,
        },
        include: {
          listing: {
            select: { id: true, slug: true, title: true, city: true },
          },
          planner: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          package: {
            select: { id: true, name: true, price: true },
          },
        },
      });

      // If DECLINED or CANCELLED, release the AvailabilitySlot back to AVAILABLE
      if (
        params.newStatus === "DECLINED" ||
        params.newStatus === "CANCELLED"
      ) {
        await tx.availabilitySlot.updateMany({
          where: {
            listingId: existing.listingId,
            date: existing.eventDate,
          },
          data: {
            status: "AVAILABLE",
            bookingId: null,
            note: null,
          },
        });
      } else if (params.newStatus === "CONFIRMED") {
        await tx.availabilitySlot.upsert({
          where: {
            listingId_date: {
              listingId: existing.listingId,
              date: existing.eventDate,
            },
          },
          update: {
            status: "BOOKED",
            bookingId: existing.id,
            note: `Confirmed · ${existing.planner.fullName}`,
          },
          create: {
            listingId: existing.listingId,
            date: existing.eventDate,
            status: "BOOKED",
            bookingId: existing.id,
            note: `Confirmed · ${existing.planner.fullName}`,
          },
        });
      }

      return {
        bookingRecord,
        ownerName: existing.listing.owner.fullName,
      };
    });

    await sendBookingStatusUpdateEmail({
      plannerEmail: updated.bookingRecord.planner.email,
      payload: {
        bookingCode: updated.bookingRecord.bookingCode,
        plannerName: updated.bookingRecord.planner.fullName,
        listingTitle: updated.bookingRecord.listing.title,
        eventDate: toIsoDateString(updated.bookingRecord.eventDate),
        newStatus: params.newStatus,
        totalAmount: updated.bookingRecord.totalAmount,
        ownerName: updated.ownerName,
        ownerResponseNote: updated.bookingRecord.ownerResponseNote,
      },
    });

    revalidatePath(`/listings/${updated.bookingRecord.listing.slug}`);
    revalidatePath("/dashboard/user");
    revalidatePath("/dashboard/owner");

    return {
      success: true,
      booking: mapPrismaBookingToUi(updated.bookingRecord),
    };
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to update booking status"),
    };
  }
}
