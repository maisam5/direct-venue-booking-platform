import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import filterReducer from "./slices/filterSlice";
import bookingDraftReducer from "./slices/bookingDraftSlice";
import uiModalReducer from "./slices/uiModalSlice";

export const store = configureStore({
  reducer: {
    filters: filterReducer,
    bookingDraft: bookingDraftReducer,
    uiModals: uiModalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
