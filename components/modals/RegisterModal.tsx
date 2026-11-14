"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useAuthModal } from "@/store/useAuthModalStore";
import { AppUserRole } from "@/store/slices/uiModalSlice";
import Modal from "./Modal";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { Building2, CalendarCheck, Sparkles } from "lucide-react";

interface RegisterValues {
  name: string;
  email: string;
  password: string;
}

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

function GoogleColoredIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

const ROLE_OPTIONS: {
  role: AppUserRole;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    role: "PLANNER",
    label: "User / Planner",
    subtitle: "Book venues & vendors",
    icon: CalendarCheck,
  },
  {
    role: "OWNER",
    label: "Venue Owner",
    subtitle: "List & manage venues",
    icon: Building2,
  },
  {
    role: "VENDOR",
    label: "Service Vendor",
    subtitle: "Catering, Photo, Decor",
    icon: Sparkles,
  },
];

export default function RegisterModal() {
  const {
    isRegisterOpen,
    isLoginOpen,
    closeRegister,
    closeLogin,
    openLogin,
    openRegister,
    currentRole,
    setRole,
    setUser,
  } = useAuthModal();

  const isOpen = isRegisterOpen || isLoginOpen;
  const isLoginMode = isLoginOpen && !isRegisterOpen;

  const clerk = useClerk();
  const { user: clerkUser } = useUser();
  const router = useRouter();

  const [values, setValues] = useState<RegisterValues>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    closeRegister();
    closeLogin();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validate = () => {
    const newErrors: RegisterErrors = {};

    if (!isLoginMode) {
      if (!values.name.trim()) {
        newErrors.name = "Name field is required!";
      } else if (values.name.length < 2) {
        newErrors.name = "Name must be at least 2 characters!";
      }
    }

    if (!values.email.trim()) {
      newErrors.email = "Email field is required!";
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      newErrors.email = "Enter a valid email!";
    }

    if (!values.password.trim()) {
      newErrors.password = "Password field is required!";
    } else if (values.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const displayName =
        values.name.trim() ||
        values.email.split("@")[0].replace(/[._-]/g, " ");

      setUser({
        id: clerkUser?.id || `usr-${Date.now()}`,
        name: displayName,
        email: values.email.trim().toLowerCase(),
        role: currentRole,
        isAuthenticated: true,
      });

      toast(
        isLoginMode
          ? `Logged in as ${displayName} (${currentRole})`
          : `Account created as ${currentRole}!`,
        {
          style: {
            background: "#FF5A5F",
            color: "white",
          },
        }
      );

      setValues({ name: "", email: "", password: "" });
      handleClose();
      router.refresh();
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
        {
          style: {
            background: "#FF5A5F",
            color: "white",
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // Save chosen role in localStorage & cookie before Clerk OAuth redirect
      if (typeof window !== "undefined") {
        window.localStorage.setItem("mgevents_role", currentRole);
        document.cookie = `mgevents_role=${currentRole}; path=/; max-age=2592000`;
      }

      // If Clerk loaded and openSignIn is available, open Clerk's Google Auth or sign in
      if (clerk && typeof clerk.openSignIn === "function") {
        handleClose();
        clerk.openSignIn({
          fallbackRedirectUrl: "/account",
        });
        return;
      }

      // Fallback instant Google session for offline/preview testing
      const defaultProfiles: Record<
        AppUserRole,
        { name: string; email: string }
      > = {
        PLANNER: {
          name: "Claire & Daniel Mercer",
          email: "claire.mercer@gmail.com",
        },
        OWNER: {
          name: "Clara Chen-strom (Venue Owner)",
          email: "clara.owner@gmail.com",
        },
        VENDOR: {
          name: "Julian Vance (Vendor Studio)",
          email: "julian.vendor@gmail.com",
        },
      };

      const profile = defaultProfiles[currentRole];
      setUser({
        id: `google-${currentRole.toLowerCase()}`,
        name: profile.name,
        email: profile.email,
        role: currentRole,
        isAuthenticated: true,
      });

      toast(`Signed in with Google as ${profile.name}`, {
        style: {
          background: "#FF5A5F",
          color: "white",
        },
      });
      handleClose();
      router.refresh();
    } catch {
      toast("Google sign-in failed", {
        style: {
          background: "#FF5A5F",
          color: "white",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const quickGoogleDemoLogin = (role: AppUserRole) => {
    setRole(role);
    const defaultProfiles: Record<
      AppUserRole,
      { name: string; email: string }
    > = {
      PLANNER: {
        name: "Claire Mercer",
        email: "claire.mercer@gmail.com",
      },
      OWNER: {
        name: "Clara Chen-strom",
        email: "clara@harborhall.local",
      },
      VENDOR: {
        name: "Oak & Ember Studio",
        email: "studio@oakandember.local",
      },
    };
    const profile = defaultProfiles[role];
    setUser({
      id: `google-${role.toLowerCase()}`,
      name: profile.name,
      email: profile.email,
      role,
      isAuthenticated: true,
    });
    toast(`Signed in with Google as ${profile.name} (${role})`, {
      style: {
        background: "#FF5A5F",
        color: "white",
      },
    });
    handleClose();
    router.refresh();
  };

  return (
    <Modal
      title={isLoginMode ? "Login with Clerk & Google" : "Register with Clerk"}
      isOpen={isOpen}
      onClose={handleClose}
    >
      {/* header */}
      <div className="mb-5 space-y-1 text-left">
        <h2 className="text-2xl font-semibold text-[var(--ink)]">
          Welcome to MG—Events
        </h2>
        <p className="text-xs text-[var(--muted)]">
          Select your account role below — your &ldquo;My Account&rdquo; menu
          adapts automatically to your role.
        </p>
      </div>

      {/* Role Selector (Planner / Venue Owner / Vendor) */}
      <div className="mb-5 space-y-1.5 text-left">
        <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
          1. Choose your role
        </span>
        <div className="grid grid-cols-3 gap-2">
          {ROLE_OPTIONS.map((item) => {
            const Icon = item.icon;
            const selected = currentRole === item.role;
            return (
              <button
                key={item.role}
                type="button"
                onClick={() => setRole(item.role)}
                className={`p-3 rounded-xl border-2 text-left transition cursor-pointer flex flex-col gap-1.5 ${
                  selected
                    ? "border-[var(--ink)] bg-[var(--soft)] text-[var(--ink)]"
                    : "border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:border-[var(--ink)]"
                }`}
              >
                <Icon size={18} className="text-[var(--ink)]" />
                <div>
                  <div className="text-xs font-semibold text-[var(--ink)]">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] leading-tight">
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Google OAuth via Clerk */}
      <div className="space-y-2.5">
        <Button
          onClick={signInWithGoogle}
          type="button"
          variant="outline"
          icon={<GoogleColoredIcon />}
        >
          Continue with Google (Clerk OAuth)
        </Button>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {(["PLANNER", "OWNER", "VENDOR"] as AppUserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => quickGoogleDemoLogin(r)}
              className="text-[11px] py-1.5 px-2 rounded-lg border border-[var(--line)] hover:border-[var(--ink)] hover:bg-[var(--soft)] text-[var(--muted)] hover:text-[var(--ink)] transition cursor-pointer"
            >
              1-Click {r === "PLANNER" ? "User" : r === "OWNER" ? "Owner" : "Vendor"}
            </button>
          ))}
        </div>
      </div>

      {/* divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--line)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[var(--bg)] px-4 text-[var(--muted)]">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {!isLoginMode && (
          <Input
            name="name"
            label="Full Name or Studio Name"
            type="text"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />
        )}
        <Input
          name="email"
          label="Email Address"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          name="password"
          label="Password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Button disabled={loading} loading={loading} type="submit">
          {isLoginMode
            ? `Login as ${
                currentRole === "PLANNER"
                  ? "User / Planner"
                  : currentRole === "OWNER"
                  ? "Venue Owner"
                  : "Vendor"
              }`
            : `Create ${
                currentRole === "PLANNER"
                  ? "User"
                  : currentRole === "OWNER"
                  ? "Venue Owner"
                  : "Vendor"
              } Account`}
        </Button>

        {/* footer */}
        <p className="text-[var(--muted)] text-center text-xs mt-4">
          {isLoginMode ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => openRegister(currentRole)}
                className="text-[var(--ink)] cursor-pointer font-semibold underline"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => openLogin(currentRole)}
                className="text-[var(--ink)] cursor-pointer font-semibold underline"
              >
                Login
              </button>
            </>
          )}
        </p>
      </form>
    </Modal>
  );
}
