import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="wrap py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="mb-6 text-center">
        <span className="label block">Clerk Authentication · Google OAuth</span>
        <h1 className="text-4xl mt-1">Create your MG—Events account</h1>
      </div>
      <Suspense fallback={<div className="label">Loading sign-up...</div>}>
        <SignUp fallbackRedirectUrl="/onboarding?role=PLANNER" />
      </Suspense>
    </main>
  );
}
