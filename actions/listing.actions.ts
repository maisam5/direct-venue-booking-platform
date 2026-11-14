"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  listingSchema,
  ListingFormValues,
} from "@/lib/validations/listingSchema";
import { mapPrismaListingToUi } from "@/lib/format";
import { getCategoryBySlug } from "@/constants/Categories";
import { Listing as UiListing, EventCategory } from "@/types";
import { AuthError, getSession, requireHost, errorMessage } from "@/lib/auth";

export interface MarketplaceQueryFilters {
  category?: EventCategory;
  maxBudget?: number;
  kindFilter?: "all" | "venue" | "vendor";
  selectedDate?: string;
  searchQuery?: string;
}

export async function getMarketplaceListingsAction(
  filters?: MarketplaceQueryFilters
): Promise<UiListing[]> {
  const records = await prisma.listing.findMany({
    include: {
      owner: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      packages: true,
      availability: {
        orderBy: { date: "asc" },
      },
    },
    orderBy: [{ category: "asc" }, { basePrice: "asc" }],
  });

  const mapped = records.map((rec, idx) => mapPrismaListingToUi(rec, idx));

  if (!filters) return mapped;

  return mapped.filter((item) => {
    const matchesKind =
      !filters.kindFilter ||
      filters.kindFilter === "all" ||
      item.kind === filters.kindFilter;

    const matchesBudget =
      typeof filters.maxBudget !== "number" ||
      item.basePrice <= filters.maxBudget;

    const matchesCategory =
      !filters.category ||
      filters.category === "all" ||
      item.categories.includes(filters.category);

    const matchesSearch =
      !filters.searchQuery?.trim() ||
      item.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      item.area.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      item.description
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase());

    const matchesDate =
      !filters.selectedDate ||
      !item.availability.some(
        (s) => s.date === filters.selectedDate && s.status !== "available"
      );

    return (
      matchesKind &&
      matchesBudget &&
      matchesCategory &&
      matchesSearch &&
      matchesDate
    );
  });
}

export async function getListingBySlugAction(
  slug: string
): Promise<UiListing | null> {
  const record = await prisma.listing.findUnique({
    where: { slug },
    include: {
      owner: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      packages: true,
      availability: {
        orderBy: { date: "asc" },
      },
    },
  });

  if (!record) return null;
  return mapPrismaListingToUi(record, 0);
}

export async function createOwnerListingAction(
  rawInput: ListingFormValues & {
    coverImage?: string;
    galleryImages?: string[];
    categorySlug?: string;
    serviceOptions?: string[];
  }
): Promise<{
  success: boolean;
  listing?: UiListing;
  error?: string;
}> {
  const parsed = listingSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid listing form data",
    };
  }

  const values = parsed.data;

  try {
    const session = await requireHost();

    const ownerRecord = await prisma.user.update({
      where: { id: session.dbUserId },
      data: {
        fullName: values.ownerName || session.fullName,
      },
    });

    const baseSlug = values.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingSlug = await prisma.listing.findUnique({
      where: { slug: baseSlug },
    });
    const slug = existingSlug
      ? `${baseSlug}-${Math.floor(100 + Math.random() * 899)}`
      : baseSlug;

    const galleryImages = (rawInput.galleryImages || []).filter(Boolean);
    if (galleryImages.length < 3 || galleryImages.length > 5) {
      return {
        success: false,
        error: "Please provide between 3 and 5 photos for your listing.",
      };
    }

    const coverImage = rawInput.coverImage || galleryImages[0];

    await prisma.user.update({
      where: { id: session.dbUserId },
      data: {
        fullName: values.ownerName || session.fullName,
        phone: values.contactPhone,
      },
    });

    const matchedCat = getCategoryBySlug(rawInput.categorySlug);
    const prismaCategory =
      matchedCat?.prismaCategory ??
      (values.kind === "venue" ? "VENUE" : "CATERING");
    const serviceOptions = (rawInput.serviceOptions || []).filter(Boolean);

    const created = await prisma.listing.create({
      data: {
        ownerId: ownerRecord.id,
        slug,
        title: values.name,
        description: values.shortSummary,
        category: prismaCategory,
        eventTypes: values.categories.map((c) => c.toUpperCase()),
        city: values.area,
        address: values.address,
        basePrice: values.basePrice,
        pricingUnit: "PER_EVENT",
        minCapacity: 15,
        maxCapacity: values.maxGuests,
        isVerified: true,
        amenities:
          values.kind === "venue"
            ? [
                values.dimensions,
                ...serviceOptions,
                ...(matchedCat ? [`Category: ${matchedCat.label}`] : []),
                "Direct owner terms · 0% commission",
              ]
            : [
                ...serviceOptions,
                ...(matchedCat ? [`Category: ${matchedCat.label}`] : []),
                "Direct owner terms · 0% commission",
              ],
        coverImage,
        galleryImages,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        packages: {
          create: [
            {
              name:
                values.kind === "vendor"
                  ? `${matchedCat?.label || "Vendor"} Direct Package`
                  : "Direct Full-Day Buyout (10 hrs)",
              description: values.shortSummary,
              price: values.basePrice,
              includedItems:
                values.kind === "vendor"
                  ? [
                      ...(serviceOptions.length > 0
                        ? serviceOptions.slice(0, 3)
                        : [`${matchedCat?.label || "Vendor"} Full Service`]),
                      "Direct vendor agreement with $0 broker markup",
                    ]
                  : [
                      "10 hours exclusive private access",
                      `Capacity up to ${values.maxGuests} guests`,
                      "Direct owner agreement with $0 broker markup",
                    ],
            },
          ],
        },
        availability: {
          create: [
            {
              date: new Date("2026-12-14T00:00:00.000Z"),
              status: "AVAILABLE",
            },
            {
              date: new Date("2026-12-16T00:00:00.000Z"),
              status: "AVAILABLE",
            },
            {
              date: new Date("2026-12-20T00:00:00.000Z"),
              status: "AVAILABLE",
            },
          ],
        },
      },
      include: {
        owner: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        packages: true,
        availability: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/properties");
    revalidatePath("/dashboard/owner");

    return {
      success: true,
      listing: mapPrismaListingToUi(created, 0),
    };
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to create owner listing"),
    };
  }
}

export async function getMyListingsAction(): Promise<UiListing[]> {
  const session = await getSession();
  if (!session) return [];

  const records = await prisma.listing.findMany({
    where: { ownerId: session.dbUserId },
    include: {
      owner: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      packages: true,
      availability: {
        orderBy: { date: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return records.map((rec, idx) => mapPrismaListingToUi(rec, idx));
}

export async function deleteListingAction(listingId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await requireHost();

    const existing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, ownerId: true, slug: true },
    });

    if (!existing) {
      return { success: false, error: "Listing not found." };
    }

    if (existing.ownerId !== session.dbUserId && session.role !== "ADMIN") {
      throw new AuthError(
        "You can only delete listings that you created.",
        "FORBIDDEN"
      );
    }

    await prisma.listing.delete({ where: { id: listingId } });

    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/properties");
    revalidatePath("/dashboard/owner");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to delete listing"),
    };
  }
}
