import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Listing } from "@/types";

export type AppUserRole = "PLANNER" | "OWNER" | "VENDOR";

export interface UiModalState {
  isCreateListingOpen: boolean;
  createListingDefaultKind: "venue" | "vendor";
  editingListing: Listing | null;
  isFilterModalOpen: boolean;
  isRegisterModalOpen: boolean;
  isLoginModalOpen: boolean;
  currentRole: AppUserRole;
  customUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: AppUserRole;
    isAuthenticated: boolean;
  } | null;
}

const initialState: UiModalState = {
  isCreateListingOpen: false,
  createListingDefaultKind: "venue",
  editingListing: null,
  isFilterModalOpen: false,
  isRegisterModalOpen: false,
  isLoginModalOpen: false,
  currentRole: "OWNER",
  customUser: null,
};

const uiModalSlice = createSlice({
  name: "uiModals",
  initialState,
  reducers: {
    openCreateListingModal(
      state,
      action: PayloadAction<"venue" | "vendor" | undefined>
    ) {
      state.isCreateListingOpen = true;
      state.editingListing = null;
      if (action.payload) {
        state.createListingDefaultKind = action.payload;
      }
    },
    openEditListingModal(state, action: PayloadAction<Listing>) {
      state.isCreateListingOpen = true;
      state.editingListing = action.payload;
      state.createListingDefaultKind = action.payload.kind;
    },
    closeCreateListingModal(state) {
      state.isCreateListingOpen = false;
      state.editingListing = null;
    },
    openFilterModal(state) {
      state.isFilterModalOpen = true;
    },
    closeFilterModal(state) {
      state.isFilterModalOpen = false;
    },
    openRegisterModal(state, action: PayloadAction<AppUserRole | undefined>) {
      state.isRegisterModalOpen = true;
      state.isLoginModalOpen = false;
      if (action.payload) {
        state.currentRole = action.payload;
      }
    },
    closeRegisterModal(state) {
      state.isRegisterModalOpen = false;
    },
    openLoginModal(state, action: PayloadAction<AppUserRole | undefined>) {
      state.isLoginModalOpen = true;
      state.isRegisterModalOpen = false;
      if (action.payload) {
        state.currentRole = action.payload;
      }
    },
    closeLoginModal(state) {
      state.isLoginModalOpen = false;
    },
    setCurrentRole(state, action: PayloadAction<AppUserRole>) {
      state.currentRole = action.payload;
      if (state.customUser) {
        state.customUser.role = action.payload;
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem("mgevents_role", action.payload);
        document.cookie = `mgevents_role=${action.payload}; path=/; max-age=2592000`;
      }
    },
    setCustomUser(
      state,
      action: PayloadAction<UiModalState["customUser"]>
    ) {
      state.customUser = action.payload;
      if (action.payload) {
        state.currentRole = action.payload.role;
      }
      if (typeof window !== "undefined") {
        if (action.payload) {
          window.localStorage.setItem(
            "mgevents_user",
            JSON.stringify(action.payload)
          );
          window.localStorage.setItem("mgevents_role", action.payload.role);
          document.cookie = `mgevents_role=${action.payload.role}; path=/; max-age=2592000`;
        } else {
          window.localStorage.removeItem("mgevents_user");
        }
      }
    },
  },
});

export const {
  openCreateListingModal,
  openEditListingModal,
  closeCreateListingModal,
  openFilterModal,
  closeFilterModal,
  openRegisterModal,
  closeRegisterModal,
  openLoginModal,
  closeLoginModal,
  setCurrentRole,
  setCustomUser,
} = uiModalSlice.actions;

export default uiModalSlice.reducer;
