"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import {
  useBookings,
  useMarketplaceListings,
  useUpdateBookingStatusMutation,
} from "@/hooks/queries";
import { formatCurrency } from "@/lib/format";
import { CalendarAvailabilityManager } from "@/components/owner/CalendarAvailabilityManager";
import { ListingForm } from "@/components/owner/ListingForm";
import { useCreateListingModal } from "@/store/useCreateListingModal";
import { useClerkAuthFlow } from "@/hooks/useClerkAuthFlow";
import { isHostRole } from "@/lib/roles";

function OwnerPortalContent() {
  const { isLoaded, isSignedIn, currentRole, startGoogleAuth, authPending } =
    useClerkAuthFlow();
  const { data: submittedBookings = [] } = useBookings(
    undefined,
    Boolean(isLoaded && isSignedIn && isHostRole(currentRole)),
    "owner"
  );
  const { data: listings = [] } = useMarketplaceListings();
  const statusMutation = useUpdateBookingStatusMutation();
  const { open: openCreateListing } = useCreateListingModal();

  if (isLoaded && !isSignedIn) {
    return (
      <main className="wrap py-20">
        <div className="max-w-xl border border-[var(--ink)] bg-[var(--bg)] p-8 space-y-4">
          <span className="label block">Owner &amp; Vendor Portal</span>
          <h1 className="text-4xl leading-tight">
            Sign in to manage your venues or services
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Register as a Venue Owner or Vendor with Google to publish listings,
            manage live availability, and keep 100% of every booking.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              disabled={authPending !== null}
              onClick={() => startGoogleAuth("OWNER", "/dashboard/owner")}
              className="btn btn-filled"
            >
              Register as Venue Owner
            </button>
            <button
              type="button"
              disabled={authPending !== null}
              onClick={() => startGoogleAuth("VENDOR", "/dashboard/owner")}
              className="btn"
            >
              Register as Vendor
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (isLoaded && isSignedIn && !isHostRole(currentRole)) {
    return (
      <main className="wrap py-20">
        <div className="max-w-xl border border-[var(--ink)] bg-[var(--bg)] p-8 space-y-4">
          <span className="label block">Host Access Required</span>
          <h1 className="text-4xl leading-tight">
            Register as a Venue Owner or Vendor
          </h1>
          <p className="text-sm text-(--muted)">
            Your account is currently an Event Planner. Upgrade to a Venue Owner
            or Service Vendor to publish listings, manage live calendars, and
            accept direct bookings.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              disabled={authPending !== null}
              onClick={() => startGoogleAuth("OWNER", "/dashboard/owner")}
              className="btn btn-filled"
            >
              Register as Venue Owner
            </button>
            <button
              type="button"
              disabled={authPending !== null}
              onClick={() => startGoogleAuth("VENDOR", "/dashboard/owner")}
              className="btn"
            >
              Register as Vendor
            </button>
            <Link href="/dashboard/user" className="btn">
              Back to My Bookings
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const directRevenue = submittedBookings
    .filter((b) => b.dbStatus !== "DECLINED" && b.dbStatus !== "CANCELLED")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <main className="pt-12">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-[var(--ink)]">
          <div>
            <span className="label">
              Owner &amp; Operator Portal · 100% Payout Retention
            </span>
            <h1 className="text-[clamp(44px,6vw,76px)] leading-[0.95] mt-2">
              Keep every booking, <i>talk directly.</i>
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                openCreateListing(
                  currentRole === "VENDOR" ? "vendor" : "venue"
                )
              }
              className="btn btn-filled"
            >
              + List {currentRole === "VENDOR" ? "Vendor Service" : "Venue"}
            </button>
            <Link href="/properties" className="btn">
              My Listings
            </Link>
            <Link href="/dashboard/user" className="btn">
              View Planner Portal
            </Link>
          </div>
        </div>

        {/* Owner KPI Strip */}
        <div className="prin border-b border-[var(--ink)]">
          <div>
            <span className="label block mb-2">Direct Booking Volume</span>
            <b>{formatCurrency(directRevenue)}</b>
            <span>100% paid directly to your venue or studio account.</span>
          </div>
          <div>
            <span className="label block mb-2">Platform / Broker Cut</span>
            <b>$0</b>
            <span>Zero commission, zero lead-unlock fees, ever.</span>
          </div>
          <div>
            <span className="label block mb-2">Verified Properties Live</span>
            <b>{listings.length}</b>
            <span>Real-time calendar sync enabled across all listings.</span>
          </div>
        </div>

        {/* Incoming Direct Booking Requests */}
        <section id="requests" className="mkt-section">
          <div className="head">
            <h2>Incoming direct requests</h2>
            <span className="label">
              Instant optimistic status updates + Resend email dispatch
            </span>
          </div>

          <div className="rows">
            {submittedBookings.map((req, idx) => (
              <div
                key={req.id}
                className="py-6 border-b border-[var(--line)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--muted)]">
                      {String(idx + 1).padStart(2, "0")} · #
                      {req.bookingCode || req.id}
                    </span>
                    <span className="free">{req.status}</span>
                  </div>
                  <h3 className="text-[30px] leading-tight mt-1">
                    {req.listingName} — {req.plannerName}
                  </h3>
                  <div className="mt-2 p-2.5 border border-[var(--line)] bg-[var(--soft)] text-xs space-y-1">
                    <div className="font-semibold text-[var(--ink)]">
                      Booker Contact Details
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[var(--ink)]">
                      <span>Name: {req.plannerName}</span>
                      <a
                        href={`mailto:${req.plannerEmail}`}
                        className="underline"
                      >
                        {req.plannerEmail}
                      </a>
                      <a href={`tel:${req.plannerPhone}`} className="underline">
                        {req.plannerPhone}
                      </a>
                    </div>
                    <div className="text-[var(--muted)]">
                      Package: {req.packageName}
                    </div>
                  </div>
                  {req.notes && (
                    <p className="text-sm text-[var(--ink)] mt-2 bg-[var(--soft)] p-2.5 border border-[var(--line)]">
                      “{req.notes}”
                    </p>
                  )}
                </div>

                <div className="lg:col-span-3 text-sm space-y-1">
                  <div>
                    <span className="label block">Event &amp; Date</span>
                    <span>
                      {req.eventCategory} · {req.eventDate}
                    </span>
                  </div>
                  <div>
                    <span className="label block">Guest Count</span>
                    <span>{req.guestCount} guests</span>
                  </div>
                </div>

                <div className="lg:col-span-2 lg:text-right">
                  <span className="label block">Net Payout (0% Fee)</span>
                  <span className="serif text-[30px] leading-none">
                    {formatCurrency(req.totalAmount)}
                  </span>
                </div>

                <div className="lg:col-span-2 flex flex-wrap lg:justify-end gap-2">
                  {(() => {
                    const isConfirmed =
                      req.dbStatus === "CONFIRMED" ||
                      req.status === "Confirmed";
                    const isDeclined =
                      req.dbStatus === "DECLINED" || req.status === "Declined";
                    const isCancelled =
                      req.dbStatus === "CANCELLED" ||
                      req.status === "Cancelled";
                    const isMutatingThis =
                      statusMutation.isPending &&
                      statusMutation.variables?.bookingId === req.id;

                    return (
                      <>
                        <button
                          type="button"
                          disabled={
                            isConfirmed || isCancelled || isMutatingThis
                          }
                          onClick={() =>
                            statusMutation.mutate({
                              bookingId: req.id,
                              newStatus: "CONFIRMED",
                              ownerResponseNote:
                                "Confirmed directly by owner. Calendar date locked.",
                            })
                          }
                          className={`btn !py-2 !px-3 text-xs disabled:opacity-60 disabled:cursor-not-allowed ${
                            isConfirmed ? "btn-filled" : ""
                          }`}
                        >
                          {isConfirmed
                            ? "Confirmed"
                            : isMutatingThis &&
                              statusMutation.variables?.newStatus ===
                                "CONFIRMED"
                            ? "Confirming..."
                            : "Confirm"}
                        </button>
                        <button
                          type="button"
                          disabled={
                            isDeclined || isCancelled || isMutatingThis
                          }
                          onClick={() =>
                            statusMutation.mutate({
                              bookingId: req.id,
                              newStatus: "DECLINED",
                              ownerResponseNote:
                                "Declined by owner. Calendar date released.",
                            })
                          }
                          className={`btn !py-2 !px-3 text-xs disabled:opacity-60 disabled:cursor-not-allowed ${
                            isDeclined ? "btn-filled" : ""
                          }`}
                        >
                          {isDeclined
                            ? "Declined"
                            : isMutatingThis &&
                              statusMutation.variables?.newStatus === "DECLINED"
                            ? "Declining..."
                            : "Decline"}
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Calendar Availability Manager & New Listing Form */}
        <section className="mkt-section">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6">
              <CalendarAvailabilityManager />
            </div>
            <div className="lg:col-span-6">
              <ListingForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function OwnerPortalDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="wrap py-20">
          <span className="label">Loading Owner Portal...</span>
        </main>
      }
    >
      <OwnerPortalContent />
    </Suspense>
  );
}
