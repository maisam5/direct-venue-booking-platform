import {
  Listing as UiListing,
  BookingRequest as UiBookingRequest,
  EventCategory,
  VendorSpecialty,
} from "@/types";

export function formatCurrency(amount: number): string {
  return "$" + Number(amount).toLocaleString("en-US");
}

export function toIsoDateString(date: Date | string): string {
  if (typeof date === "string") {
    return date.slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

const EVENT_TYPE_TO_UI: Record<string, Exclude<EventCategory, "all">> = {
  WEDDING: "Wedding",
  BIRTHDAY: "Birthday",
  CORPORATE: "Corporate",
  Wedding: "Wedding",
  Birthday: "Birthday",
  Corporate: "Corporate",
};

const CATEGORY_TO_VENDOR_SPECIALTY: Record<string, VendorSpecialty | undefined> = {
  CATERING: "Catering",
  PHOTOGRAPHY: "Photography",
  DECOR: "Florals",
  ENTERTAINMENT: "Sound",
};

export interface PrismaListingWithRelations {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  description: string;
  category: "VENUE" | "CATERING" | "PHOTOGRAPHY" | "DECOR" | "ENTERTAINMENT";
  eventTypes: string[];
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  basePrice: number;
  pricingUnit: "PER_EVENT" | "PER_HEAD" | "PER_DAY";
  minCapacity: number;
  maxCapacity: number;
  isVerified: boolean;
  amenities: string[];
  coverImage: string;
  galleryImages: string[];
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  packages: {
    id: string;
    name: string;
    description: string;
    price: number;
    includedItems: string[];
  }[];
  availability: {
    id: string;
    date: Date;
    status: "AVAILABLE" | "BOOKED" | "BLOCKED";
    note: string | null;
  }[];
}

export function mapPrismaListingToUi(
  record: PrismaListingWithRelations,
  indexZeroBased: number = 0
): UiListing {
  const isVenue = record.category === "VENUE";
  const priceType = record.pricingUnit === "PER_HEAD" ? "per_guest" : "flat";
  const priceUnitLabel =
    record.pricingUnit === "PER_HEAD"
      ? `From $${record.basePrice.toLocaleString("en-US")} per guest`
      : !isVenue
      ? `From $${record.basePrice.toLocaleString("en-US")}`
      : `$${record.basePrice.toLocaleString("en-US")}`;

  const uiCategories = record.eventTypes
    .map((et) => EVENT_TYPE_TO_UI[et])
    .filter((v): v is Exclude<EventCategory, "all"> => Boolean(v));

  const nextOpenSlot = record.availability.find(
    (s) => s.status === "AVAILABLE"
  );
  const availabilityLabel = !isVenue
    ? "Available"
    : nextOpenSlot
    ? `Open Dec ${Number(toIsoDateString(nextOpenSlot.date).split("-")[2])}`
    : "Open this week";

  const isValidImg = (img?: string | null) =>
    Boolean(img && (img.startsWith("http") || img.startsWith("data:")));

  const resolvedGallery = (record.galleryImages || []).filter(isValidImg);
  const resolvedCover = isValidImg(record.coverImage)
    ? record.coverImage
    : resolvedGallery[0] ||
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=85";

  const finalGallery =
    resolvedGallery.length > 0 ? resolvedGallery : [resolvedCover];

  return {
    id: record.id,
    slug: record.slug,
    indexNumber: String(indexZeroBased + 1).padStart(2, "0"),
    name: record.title,
    kind: isVenue ? "venue" : "vendor",
    vendorSpecialty: CATEGORY_TO_VENDOR_SPECIALTY[record.category],
    area: record.city,
    address: record.address,
    maxGuests: record.maxCapacity,
    basePrice: record.basePrice,
    priceUnitLabel,
    categories:
      uiCategories.length > 0 ? uiCategories : ["Wedding", "Corporate"],
    availabilityLabel,
    verified: record.isVerified,
    verifiedDate: "Visited & Verified 2026",
    ownerId: record.ownerId,
    ownerName: record.owner?.fullName || "Direct Property Owner",
    ownerEmail: record.contactEmail || record.owner?.email || undefined,
    ownerPhone: record.contactPhone || record.owner?.phone || undefined,
    ownerRole: isVenue ? "Direct Property Owner" : "Principal Studio Owner",
    ownerResponseTime: "Replies within 2 hours",
    shortSummary: record.description.split(".")[0] + ".",
    description: record.description,
    architecturalNotes: record.amenities.join(" · "),
    dimensions: record.amenities[0] || `Up to ${record.maxCapacity} guests`,
    coverImage: resolvedCover,
    galleryImages: finalGallery,
    packages:
      record.packages.length > 0
        ? record.packages.map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            priceType,
            maxGuests: record.maxCapacity,
            includedFeatures: pkg.includedItems,
          }))
        : [
            {
              id: `pkg-default-${record.id}`,
              name: "Standard Direct Buyout",
              description: record.description,
              price: record.basePrice,
              priceType,
              maxGuests: record.maxCapacity,
              includedFeatures: record.amenities,
            },
          ],
    addOns: [
      {
        id: `addon-1-${record.id}`,
        name: isVenue
          ? "Extended Load-In & Strike Window (+2 hrs)"
          : "Priority On-Site Rehearsal / Walkthrough",
        description:
          "Direct owner-coordinated early access with zero agency fee.",
        price: 250,
      },
      {
        id: `addon-2-${record.id}`,
        name: isVenue
          ? "Architectural Warm Perimeter Lighting"
          : "Extended Evening Coverage / Service",
        description: "Pre-configured before guest arrival.",
        price: 380,
      },
    ],
    availability: record.availability.map((slot) => ({
      date: toIsoDateString(slot.date),
      status: slot.status.toLowerCase() as "available" | "booked" | "blocked",
      note: slot.note ?? undefined,
    })),
    galleryCaptions: finalGallery.slice(0, 3).map((_, idx) => ({
      title:
        idx === 0
          ? `${record.title} · Primary View`
          : idx === 1
          ? `${record.city} · Event Space`
          : "Service & Guest Arrival",
      aspect: idx === 0 ? "4/5" : "16/10",
      note: record.amenities[idx] || record.address,
    })),
  };
}

export interface PrismaBookingWithRelations {
  id: string;
  bookingCode: string;
  listingId: string;
  plannerId: string;
  packageId: string | null;
  eventDate: Date;
  eventType: string;
  guestCount: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELLED";
  plannerNotes: string | null;
  ownerResponseNote: string | null;
  createdAt: Date;
  listing: {
    id: string;
    slug: string;
    title: string;
    city: string;
  };
  planner: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  package: {
    id: string;
    name: string;
    price: number;
  } | null;
}

export function mapPrismaBookingToUi(
  b: PrismaBookingWithRelations
): UiBookingRequest {
  const statusMap: Record<
    PrismaBookingWithRelations["status"],
    UiBookingRequest["status"]
  > = {
    CONFIRMED: "Confirmed",
    PENDING: "Pending Owner Reply",
    DECLINED: "Declined",
    CANCELLED: "Cancelled",
  };

  const pkgPrice = b.package?.price ?? b.totalAmount;
  const venueSubtotal = Math.min(pkgPrice, b.totalAmount);
  const addOnsSubtotal = Math.max(0, b.totalAmount - venueSubtotal);

  return {
    id: b.id,
    bookingCode: b.bookingCode,
    listingId: b.listingId,
    listingSlug: b.listing.slug,
    listingName: b.listing.title,
    area: b.listing.city,
    plannerName: b.planner.fullName,
    plannerEmail: b.planner.email,
    plannerPhone: b.planner.phone || "Not provided",
    eventCategory: EVENT_TYPE_TO_UI[b.eventType] || "Wedding",
    eventDate: toIsoDateString(b.eventDate),
    guestCount: b.guestCount,
    packageId: b.packageId || "",
    packageName: b.package?.name || "Direct Owner Package",
    selectedAddOnIds: [],
    venueSubtotal,
    addOnsSubtotal,
    brokerFee: 0,
    totalAmount: b.totalAmount,
    status: statusMap[b.status] || "Pending Owner Reply",
    dbStatus: b.status,
    notes: b.plannerNotes || "",
    ownerResponseNote: b.ownerResponseNote || undefined,
    createdAt: toIsoDateString(b.createdAt),
  };
}
