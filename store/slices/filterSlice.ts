import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EventCategory } from "@/types";

export interface FilterState {
  category: EventCategory;
  minBudget: number;
  maxBudget: number;
  guestRange: string;
  selectedDate: string;
  searchQuery: string;
  kindFilter: "all" | "venue" | "vendor";
}

const initialState: FilterState = {
  category: "all",
  minBudget: 1000,
  maxBudget: 6000, // Matches the HTML template's default $6,000 slider value
  guestRange: "Up to 50",
  selectedDate: "",
  searchQuery: "",
  kindFilter: "all",
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<EventCategory>) {
      state.category = action.payload;
    },
    setMaxBudget(state, action: PayloadAction<number>) {
      state.maxBudget = action.payload;
    },
    setMinBudget(state, action: PayloadAction<number>) {
      state.minBudget = action.payload;
    },
    setGuestRange(state, action: PayloadAction<string>) {
      state.guestRange = action.payload;
    },
    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setKindFilter(state, action: PayloadAction<"all" | "venue" | "vendor">) {
      state.kindFilter = action.payload;
    },
    resetFilters(state) {
      state.category = "all";
      state.minBudget = 1000;
      state.maxBudget = 12000;
      state.guestRange = "any";
      state.selectedDate = "";
      state.searchQuery = "";
      state.kindFilter = "all";
    },
  },
});

export const {
  setCategory,
  setMaxBudget,
  setMinBudget,
  setGuestRange,
  setSelectedDate,
  setSearchQuery,
  setKindFilter,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
