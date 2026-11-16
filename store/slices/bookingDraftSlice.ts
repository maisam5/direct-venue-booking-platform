import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BookingRequest, EventCategory, Listing } from "@/types";

export interface BookingDraftState {
  selectedListingSlug: string;
  selectedPackageId: string;
  eventCategory: Exclude<EventCategory, "all">;
  eventDate: string;
  guestCount: number;
  selectedAddOnIds: string[];
  venueSubtotal: number;
  addOnsSubtotal: number;
  brokerFee: 0;
  calculatedTotal: number;
  savedSlugs: string[];
  activeListing: Listing | null;
}

function computeTotals(
  listing: Listing | null,
  packageId: string,
  guestCount: number,
  addOnIds: string[]
) {
  if (!listing) {
    return { venueSubtotal: 0, addOnsSubtotal: 0, calculatedTotal: 0 };
  }
  const pkg =
    listing.packages.find((p) => p.id === packageId) ?? listing.packages[0];
  const venueSubtotal = pkg
    ? pkg.priceType === "per_guest"
      ? pkg.price * guestCount
      : pkg.price
    : listing.basePrice;

  const addOnsSubtotal = listing.addOns
    .filter((a) => addOnIds.includes(a.id))
    .reduce((sum, item) => sum + item.price, 0);

  return {
    venueSubtotal,
    addOnsSubtotal,
    calculatedTotal: venueSubtotal + addOnsSubtotal,
  };
}

const initialState: BookingDraftState = {
  selectedListingSlug: "harbor-hall",
  selectedPackageId: "",
  eventCategory: "Wedding",
  eventDate: "2026-12-14",
  guestCount: 150,
  selectedAddOnIds: [],
  venueSubtotal: 4800,
  addOnsSubtotal: 0,
  brokerFee: 0,
  calculatedTotal: 4800,
  savedSlugs: [
    "harbor-hall",
    "linden-estate",
    "oak-and-ember",
    "northlight-studio",
  ],
  activeListing: null,
};

const bookingDraftSlice = createSlice({
  name: "bookingDraft",
  initialState,
  reducers: {
    hydrateDraftWithListing(state, action: PayloadAction<Listing>) {
      const listing = action.payload;
      state.activeListing = listing;
      state.selectedListingSlug = listing.slug;
      const pkg = listing.packages[0];
      state.selectedPackageId = pkg ? pkg.id : "";
      state.selectedAddOnIds = [];
      if (listing.categories && listing.categories.length > 0) {
        state.eventCategory = listing.categories[0];
      }
      const firstOpen = listing.availability.find(
        (slot) => slot.status === "available"
      );
      if (firstOpen) {
        state.eventDate = firstOpen.date;
      } else {
        const unavailableDates = new Set(
          listing.availability
            .filter((s) => s.status === "booked" || s.status === "blocked")
            .map((s) => s.date)
        );
        for (let day = 14; day <= 31; day++) {
          const candidate = `2026-12-${String(day).padStart(2, "0")}`;
          if (!unavailableDates.has(candidate)) {
            state.eventDate = candidate;
            break;
          }
        }
      }
      state.guestCount = Math.max(
        1,
        Math.min(state.guestCount, listing.maxGuests || 150)
      );
      const totals = computeTotals(
        listing,
        state.selectedPackageId,
        state.guestCount,
        state.selectedAddOnIds
      );
      state.venueSubtotal = totals.venueSubtotal;
      state.addOnsSubtotal = totals.addOnsSubtotal;
      state.calculatedTotal = totals.calculatedTotal;
    },
    selectPackageTier(state, action: PayloadAction<string>) {
      state.selectedPackageId = action.payload;
      const totals = computeTotals(
        state.activeListing,
        state.selectedPackageId,
        state.guestCount,
        state.selectedAddOnIds
      );
      state.venueSubtotal = totals.venueSubtotal;
      state.addOnsSubtotal = totals.addOnsSubtotal;
      state.calculatedTotal = totals.calculatedTotal;
    },
    setDraftEventDate(state, action: PayloadAction<string>) {
      state.eventDate = action.payload;
    },
    setDraftEventCategory(
      state,
      action: PayloadAction<Exclude<EventCategory, "all">>
    ) {
      state.eventCategory = action.payload;
    },
    setDraftGuestCount(state, action: PayloadAction<number>) {
      state.guestCount = action.payload;
      const totals = computeTotals(
        state.activeListing,
        state.selectedPackageId,
        state.guestCount,
        state.selectedAddOnIds
      );
      state.venueSubtotal = totals.venueSubtotal;
      state.addOnsSubtotal = totals.addOnsSubtotal;
      state.calculatedTotal = totals.calculatedTotal;
    },
    toggleAddOn(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.selectedAddOnIds.includes(id)) {
        state.selectedAddOnIds = state.selectedAddOnIds.filter((x) => x !== id);
      } else {
        state.selectedAddOnIds.push(id);
      }
      const totals = computeTotals(
        state.activeListing,
        state.selectedPackageId,
        state.guestCount,
        state.selectedAddOnIds
      );
      state.venueSubtotal = totals.venueSubtotal;
      state.addOnsSubtotal = totals.addOnsSubtotal;
      state.calculatedTotal = totals.calculatedTotal;
    },
    toggleSavedListing(state, action: PayloadAction<string>) {
      const slug = action.payload;
      if (state.savedSlugs.includes(slug)) {
        state.savedSlugs = state.savedSlugs.filter((s) => s !== slug);
      } else {
        state.savedSlugs.push(slug);
      }
    },
  },
});

export const {
  hydrateDraftWithListing,
  selectPackageTier,
  setDraftEventDate,
  setDraftEventCategory,
  setDraftGuestCount,
  toggleAddOn,
  toggleSavedListing,
} = bookingDraftSlice.actions;

export default bookingDraftSlice.reducer;
