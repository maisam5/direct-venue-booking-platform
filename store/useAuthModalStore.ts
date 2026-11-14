"use client";

import { useAppDispatch, useAppSelector } from "./index";
import {
  AppUserRole,
  openRegisterModal,
  closeRegisterModal,
  openLoginModal,
  closeLoginModal,
  setCurrentRole,
  setCustomUser,
} from "./slices/uiModalSlice";

export function useAuthModal() {
  const dispatch = useAppDispatch();
  const {
    isRegisterModalOpen,
    isLoginModalOpen,
    currentRole,
    customUser,
  } = useAppSelector((state) => state.uiModals);

  return {
    isRegisterOpen: isRegisterModalOpen,
    isLoginOpen: isLoginModalOpen,
    currentRole,
    customUser,
    openRegister: (role?: AppUserRole) => dispatch(openRegisterModal(role)),
    closeRegister: () => dispatch(closeRegisterModal()),
    openLogin: (role?: AppUserRole) => dispatch(openLoginModal(role)),
    closeLogin: () => dispatch(closeLoginModal()),
    setRole: (role: AppUserRole) => dispatch(setCurrentRole(role)),
    setUser: (user: typeof customUser) => dispatch(setCustomUser(user)),
  };
}
