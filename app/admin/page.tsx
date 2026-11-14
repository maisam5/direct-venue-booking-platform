import React, { Suspense } from "react";
import { getAdminEmail, isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

async function AdminPageContent() {
  const authenticated = await isAdminAuthenticated();
  const adminEmail = authenticated ? getAdminEmail() : "";

  return (
    <AdminDashboardClient
      initialAuthenticated={authenticated}
      initialAdminEmail={adminEmail}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="wrap py-20 text-center text-sm text-[var(--muted)]">
          Loading Admin Dashboard...
        </main>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
