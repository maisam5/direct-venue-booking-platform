import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="wrap py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="mb-6 text-center">
        <span className="label block">Clerk Authentication · Google OAuth</span>
        <h1 className="text-4xl mt-1">Sign in to MG—Events</h1>
      </div>
      <Suspense fallback={<div className="label">Loading sign-in...</div>}>
        <SignIn fallbackRedirectUrl="/onboarding?role=PLANNER" />
      </Suspense>
    </main>
  );
}
