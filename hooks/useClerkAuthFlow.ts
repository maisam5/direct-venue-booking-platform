"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs/legacy";
import {
  AppRole,
  SelfServeRole,
  buildOnboardingUrl,
  parseRole,
  roleHomePath,
  ROLE_LABELS,
} from "@/lib/roles";
import { completeOnboardingAction } from "@/actions/auth.actions";
import { toast } from "@/lib/toast";

export function useClerkAuthFlow() {
  const router = useRouter();
  const clerk = useClerk();
  const { user, isSignedIn, isLoaded } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const [authPending, setAuthPending] = useState<SelfServeRole | null>(null);

  const currentRole: AppRole =
    parseRole(user?.publicMetadata?.role) ?? "PLANNER";

  const startGoogleAuth = async (
    role: SelfServeRole,
    redirectTo?: string | null
  ) => {
    setAuthPending(role);
    try {
      // If user is already signed in, upgrade/complete role server-side directly
      if (isSignedIn && user) {
        const res = await completeOnboardingAction({ role });
        if (!res.ok) {
          toast(res.error, {
            style: { background: "#dc2626", color: "white" },
          });
          return;
        }
        await user.reload();
        if (res.notice) {
          toast(res.notice);
        } else {
          toast(`Account active as ${ROLE_LABELS[res.role]}`);
        }
        router.push(redirectTo || roleHomePath(res.role));
        router.refresh();
        return;
      }

      const onboardingUrl = buildOnboardingUrl(role, redirectTo);

      if (signInLoaded && signIn) {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: onboardingUrl,
        });
        return;
      }

      // Fallback: open Clerk Sign-In modal pointing to onboarding
      clerk.openSignIn({
        fallbackRedirectUrl: onboardingUrl,
      });
    } catch {
      // Fallback to Clerk modal if Google redirect was blocked or cancelled
      clerk.openSignIn({
        fallbackRedirectUrl: buildOnboardingUrl(role, redirectTo),
      });
    } finally {
      setAuthPending(null);
    }
  };

  return {
    user,
    isSignedIn: Boolean(isSignedIn),
    isLoaded,
    currentRole,
    authPending,
    startGoogleAuth,
  };
}
