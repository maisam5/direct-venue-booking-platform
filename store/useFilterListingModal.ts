"use client";

import { useAppDispatch, useAppSelector } from "./index";
import { openFilterModal, closeFilterModal } from "./slices/uiModalSlice";

export function useFilterModal() {
  const dispatch = useAppDispatch();
  const { isFilterModalOpen } = useAppSelector((state) => state.uiModals);

  return {
    isOpen: isFilterModalOpen,
    open: () => dispatch(openFilterModal()),
    close: () => dispatch(closeFilterModal()),
  };
}
