export type EventCategory = "all" | "Wedding" | "Birthday" | "Corporate";

export type ListingKind = "venue" | "vendor";

export type VendorSpecialty = "Catering" | "Photography" | "Florals" | "Sound";

export interface PackageTier {
  id: string;
  name: string;
  description: string;
  price: number;
  priceType: "flat" | "per_guest";
  maxGuests: number;
  includedFeatures: string[];
}

export interface AddOnItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  status: "available" | "booked" | "blocked";
  note?: string;
}

export interface Listing {
  id: string;
  slug: string;
  indexNumber: string;
  name: string;
  kind: ListingKind;
  area: string;
  address: string;
  maxGuests: number;
  basePrice: number;
  priceUnitLabel: string;
  categories: Exclude<EventCategory, "all">[];
  vendorSpecialty?: VendorSpecialty;
  availabilityLabel: string;
  verified: boolean;
  verifiedDate: string;
  ownerId?: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerRole: string;
  ownerResponseTime: string;
  shortSummary: string;
  description: string;
  architecturalNotes: string;
  dimensions: string;
  coverImage?: string;
  galleryImages?: string[];
  packages: PackageTier[];
  addOns: AddOnItem[];
  availability: AvailabilitySlot[];
  galleryCaptions: {
    title: string;
    aspect: string;
    note: string;
  }[];
}

export interface BookingRequest {
  id: string;
  bookingCode?: string;
  listingId: string;
  listingSlug: string;
  listingName: string;
  area: string;
  plannerName: string;
  plannerEmail: string;
  plannerPhone: string;
  eventCategory: Exclude<EventCategory, "all">;
  eventDate: string;
  guestCount: number;
  packageId: string;
  packageName: string;
  selectedAddOnIds: string[];
  venueSubtotal: number;
  addOnsSubtotal: number;
  brokerFee: 0;
  totalAmount: number;
  status:
    | "Confirmed"
    | "Pending Owner Reply"
    | "Date Hold"
    | "Declined"
    | "Cancelled";
  dbStatus?: "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELLED";
  notes: string;
  ownerResponseNote?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "planner" | "owner";
  targetBudget: number;
  plannedEventDate: string;
  plannedEventCategory: Exclude<EventCategory, "all">;
  savedListingSlugs: string[];
}
