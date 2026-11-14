"use client";

import { useAppDispatch, useAppSelector } from "./index";
import {
  openCreateListingModal,
  openEditListingModal,
  closeCreateListingModal,
} from "./slices/uiModalSlice";
import { Listing } from "@/types";

export function useCreateListingModal() {
  const dispatch = useAppDispatch();
  const {
    isCreateListingOpen,
    createListingDefaultKind,
    editingListing,
  } = useAppSelector((state) => state.uiModals);

  return {
    isOpen: isCreateListingOpen,
    defaultKind: createListingDefaultKind,
    editingListing,
    open: (kind?: "venue" | "vendor") => dispatch(openCreateListingModal(kind)),
    openEdit: (listing: Listing) => dispatch(openEditListingModal(listing)),
    close: () => dispatch(closeCreateListingModal()),
  };
}
