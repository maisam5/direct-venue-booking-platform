"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { completeOnboardingAction } from "@/actions/auth.actions";
import {
  parseSelfServeRole,
  roleHomePath,
  sanitizeRedirect,
  ROLE_LABELS,
} from "@/lib/roles";
import { toast } from "@/lib/toast";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, user } = useUser();
  const [error, setError] = useState<string | null>(null);

  const requestedRole = parseSelfServeRole(searchParams.get("role")) ?? "PLANNER";
  const redirectTarget = sanitizeRedirect(searchParams.get("redirect"));

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace(
        `/sign-in?redirect_url=${encodeURIComponent(
          `/onboarding?role=${requestedRole}${
            redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : ""
          }`
        )}`
      );
      return;
    }

    let cancelled = false;

    async function runOnboarding() {
      const res = await completeOnboardingAction({ role: requestedRole });
      if (cancelled) return;

      if (!res.ok) {
        setError(res.error);
        return;
      }

      if (user) {
        await user.reload();
      }

      if (res.notice) {
        toast(res.notice);
      } else {
        toast(`Signed in as ${ROLE_LABELS[res.role]}`);
      }

      const destination = redirectTarget || roleHomePath(res.role);
      router.replace(destination);
      router.refresh();
    }

    runOnboarding();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, requestedRole, redirectTarget, router, user]);

  return (
    <main className="wrap py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="max-w-md w-full border border-[var(--ink)] bg-[var(--bg)] p-8 space-y-4">
        <span className="label block">Setting Up Your Account</span>
        <h1 className="text-3xl leading-tight">
          {error ? "Setup paused" : `Configuring ${ROLE_LABELS[requestedRole]} access...`}
        </h1>
        {error ? (
          <>
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => router.replace("/")}
              className="btn btn-filled w-full"
            >
              Return Home
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="h-7 w-7 rounded-full border-2 border-[var(--ink)] border-t-transparent animate-spin" />
            <p className="text-xs text-[var(--muted)]">
              Syncing your Google profile and permissions with MG—Events...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="wrap py-24 flex justify-center">
          <span className="label">Loading onboarding...</span>
        </main>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
