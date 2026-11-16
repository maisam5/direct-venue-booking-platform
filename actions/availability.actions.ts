"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireHost, errorMessage } from "@/lib/auth";
import { toIsoDateString } from "@/lib/format";
import { AvailabilitySlot } from "@/types";

const toggleAvailabilityInputSchema = z.object({
  listingId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  note: z.string().max(160).optional(),
});

export async function getListingAvailabilityAction(
  listingId: string,
  month?: string // e.g., "2026-12"
): Promise<AvailabilitySlot[]> {
  let dateFilter: { gte?: Date; lte?: Date } | undefined;

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const m = Number(monthStr);
    const start = new Date(Date.UTC(year, m - 1, 1));
    const end = new Date(Date.UTC(year, m, 0));
    dateFilter = { gte: start, lte: end };
  }

  const [slots, activeBookings] = await Promise.all([
    prisma.availabilitySlot.findMany({
      where: {
        listingId,
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      orderBy: { date: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        listingId,
        status: { in: ["PENDING", "CONFIRMED"] },
        ...(dateFilter ? { eventDate: dateFilter } : {}),
      },
      select: { eventDate: true, eventType: true },
    }),
  ]);

  const mapByDate = new Map<string, AvailabilitySlot>();

  for (const s of slots) {
    const d = toIsoDateString(s.date);
    mapByDate.set(d, {
      date: d,
      status: s.status.toLowerCase() as "available" | "booked" | "blocked",
      note: s.note ?? undefined,
    });
  }

  for (const b of activeBookings) {
    const d = toIsoDateString(b.eventDate);
    mapByDate.set(d, {
      date: d,
      status: "booked",
      note: "Reserved by another user",
    });
  }

  return Array.from(mapByDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export async function toggleDateAvailability(rawInput: {
  listingId: string;
  date: string;
  note?: string;
}): Promise<{
  success: boolean;
  slot?: AvailabilitySlot;
  error?: string;
}> {
  const parsed = toggleAvailabilityInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid calendar toggle input",
    };
  }

  const { listingId, date, note } = parsed.data;
  const dateObj = new Date(`${date}T00:00:00.000Z`);

  try {
    const session = await requireHost();

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, slug: true, ownerId: true },
    });

    if (!listing) {
      return { success: false, error: "Listing not found" };
    }

    if (listing.ownerId !== session.dbUserId && session.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized: You do not own this listing",
      };
    }

    const existing = await prisma.availabilitySlot.findUnique({
      where: {
        listingId_date: {
          listingId: listing.id,
          date: dateObj,
        },
      },
    });

    if (existing && existing.status === "BOOKED") {
      return {
        success: false,
        error:
          "Cannot manually override an active BOOKED date. Decline or cancel the booking first.",
      };
    }

    const nextStatus =
      existing && existing.status === "BLOCKED" ? "AVAILABLE" : "BLOCKED";

    const upserted = await prisma.availabilitySlot.upsert({
      where: {
        listingId_date: {
          listingId: listing.id,
          date: dateObj,
        },
      },
      update: {
        status: nextStatus,
        note: nextStatus === "BLOCKED" ? note || "Owner Hold" : null,
      },
      create: {
        listingId: listing.id,
        date: dateObj,
        status: nextStatus,
        note: nextStatus === "BLOCKED" ? note || "Owner Hold" : null,
      },
    });

    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath(`/listings/${listing.slug}`);
    revalidatePath("/dashboard/owner");

    return {
      success: true,
      slot: {
        date: toIsoDateString(upserted.date),
        status: upserted.status.toLowerCase() as
          | "available"
          | "booked"
          | "blocked",
        note: upserted.note ?? undefined,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to toggle date availability"),
    };
  }
}
