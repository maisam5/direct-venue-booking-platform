"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <main className="wrap py-24 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--ink)] border-t-transparent animate-spin" />
      <p className="label">Completing Google Sign-In...</p>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/onboarding?role=PLANNER"
        signUpFallbackRedirectUrl="/onboarding?role=PLANNER"
      />
    </main>
  );
}
