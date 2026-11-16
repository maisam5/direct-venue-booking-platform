"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { completeOnboardingAction } from "@/actions/auth.actions";
import {
  executePendingBookingOnce,
  peekPendingBooking,
} from "@/lib/pending-booking";
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
  const queryClient = useQueryClient();
  const { isLoaded, isSignedIn, user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const startedRef = useRef(false);

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

    if (startedRef.current) return;
    startedRef.current = true;

    async function runOnboarding() {
      const pendingPreview = peekPendingBooking();
      if (pendingPreview) {
        setStatusMessage(
          `Confirming your booking for ${pendingPreview.listingName}...`
        );
      }

      const res = await completeOnboardingAction({ role: requestedRole });
      if (!res.ok) {
        setError(res.error);
        return;
      }

      if (user) {
        await user.reload().catch(() => null);
      }

      const pendingResult = await executePendingBookingOnce({
        fullName: user?.fullName,
        firstName: user?.firstName,
        email: user?.primaryEmailAddress?.emailAddress,
        phone: user?.primaryPhoneNumber?.phoneNumber,
      });

      if (pendingResult.executed && pendingResult.pending) {
        if (pendingResult.success && pendingResult.booking) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["bookings"] }),
            queryClient.invalidateQueries({ queryKey: ["listings"] }),
            queryClient.invalidateQueries({
              queryKey: ["availability", pendingResult.pending.listingId],
            }),
          ]);
          const code =
            pendingResult.booking.bookingCode || pendingResult.booking.id;
          toast(
            `Signed in & booking #${code} sent to ${pendingResult.pending.ownerName}!`
          );
          router.replace(
            `/listings/${
              pendingResult.pending.listingSlug
            }?booked=${encodeURIComponent(code)}`
          );
          return;
        } else {
          toast(
            pendingResult.error ||
              "Signed in, but could not complete booking."
          );
          router.replace(`/listings/${pendingResult.pending.listingSlug}`);
          return;
        }
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
  }, [
    isLoaded,
    isSignedIn,
    requestedRole,
    redirectTarget,
    router,
    user,
    queryClient,
  ]);

  return (
    <main className="wrap py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="max-w-md w-full border border-[var(--ink)] bg-[var(--bg)] p-8 space-y-4">
        <span className="label block">Setting Up Your Account</span>
        <h1 className="text-3xl leading-tight">
          {error
            ? "Setup paused"
            : statusMessage ||
              `Configuring ${ROLE_LABELS[requestedRole]} access...`}
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
