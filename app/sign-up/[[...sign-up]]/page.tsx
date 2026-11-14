import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="wrap py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="mb-6 text-center">
        <span className="label block">Clerk Authentication · Google OAuth</span>
        <h1 className="text-4xl mt-1">Create your MG—Events account</h1>
      </div>
      <SignUp fallbackRedirectUrl="/account" />
    </main>
  );
}
