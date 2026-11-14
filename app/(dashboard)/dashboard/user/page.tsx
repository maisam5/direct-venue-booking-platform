"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleSavedListing } from "@/store/slices/bookingDraftSlice";
import {
  useBookings,
  useMarketplaceListings,
  useUpdateBookingStatusMutation,
} from "@/hooks/queries";
import { formatCurrency } from "@/lib/format";
import { BookingRequest, Listing } from "@/types";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { QuickBookModal } from "@/components/booking/QuickBookModal";
import { useClerkAuthFlow } from "@/hooks/useClerkAuthFlow";

function UserPlannerContent() {
  const dispatch = useAppDispatch();
  const { savedSlugs } = useAppSelector((state) => state.bookingDraft);
  const { data: submittedBookings = [] } = useBookings();
  const { data: listings = [] } = useMarketplaceListings();
  const statusMutation = useUpdateBookingStatusMutation();
  const { user, isLoaded, isSignedIn, startGoogleAuth, authPending } =
    useClerkAuthFlow();
  const displayName = user?.fullName || user?.firstName || "Event Planner";

  if (isLoaded && !isSignedIn) {
    return (
      <main className="wrap py-20">
        <div className="max-w-xl border border-[var(--ink)] bg-[var(--bg)] p-8 space-y-4">
          <span className="label block">Event Planner Portal</span>
          <h1 className="text-4xl leading-tight">
            Sign in with Google to view your bookings
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Track your direct venue &amp; vendor agreements, manage your event
            budget, and access your saved shortlist.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              disabled={authPending !== null}
              onClick={() => startGoogleAuth("PLANNER", "/dashboard/user")}
              className="btn btn-filled"
            >
              {authPending === "PLANNER"
                ? "Connecting Google..."
                : "Login using Google"}
            </button>
            <Link href="/explore" className="btn">
              Explore Venues &amp; Vendors
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const [targetBudget, setTargetBudget] = useState(14000);
  const [selectedContract, setSelectedContract] =
    useState<BookingRequest | null>(null);
  const [quickBookListing, setQuickBookListing] = useState<Listing | null>(
    null
  );

  const activeBookings = submittedBookings.filter(
    (b) => b.dbStatus !== "DECLINED" && b.dbStatus !== "CANCELLED"
  );

  const totalCommitted = activeBookings.reduce(
    (sum, b) => sum + b.totalAmount,
    0
  );
  const remainingBudget = targetBudget - totalCommitted;
  const estimatedBrokerSavings = Math.round(totalCommitted * 0.18);

  const savedListings = listings.filter((item) =>
    savedSlugs.includes(item.slug)
  );

  return (
    <main className="pt-12">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-[var(--ink)]">
          <div>
            <span className="label">
              Event Planner Portal · {displayName}
            </span>
            <h1 className="text-[clamp(44px,6vw,76px)] leading-[0.95] mt-2">
              Your direct bookings &amp; <i>budget.</i>
            </h1>
          </div>
          <div className="flex gap-3">
            <Link href="/explore" className="btn">
              Browse Venues &amp; Vendors
            </Link>
            <Link href="/dashboard/owner" className="btn">
              Switch to Owner View
            </Link>
          </div>
        </div>

        {/* Budget Tracker Strip */}
        <div className="prin border-b border-[var(--ink)]">
          <div>
            <span className="label block mb-2">Total Committed (0% Fee)</span>
            <b>{formatCurrency(totalCommitted)}</b>
            <span>
              Across {activeBookings.length} direct owner{" "}
              {activeBookings.length === 1 ? "agreement" : "agreements"}.
            </span>
          </div>

          <div>
            <span className="label block mb-2">
              Remaining of {formatCurrency(targetBudget)} Budget
            </span>
            <b>
              {remainingBudget >= 0
                ? formatCurrency(remainingBudget)
                : `-${formatCurrency(Math.abs(remainingBudget))}`}
            </b>
            <div className="mt-2 max-w-[260px]">
              <input
                type="range"
                min={4000}
                max={30000}
                step={500}
                value={targetBudget}
                aria-label="Adjust target overall event budget"
                onChange={(e) => setTargetBudget(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <span className="label block mb-2">Broker Commission Saved</span>
            <b>{formatCurrency(estimatedBrokerSavings)}</b>
            <span>
              Saved by contracting directly with property and studio owners.
            </span>
          </div>
        </div>

        {/* Active Direct Bookings */}
        <section className="mkt-section">
          <div className="head">
            <h2>Active direct bookings</h2>
            <span className="label">
              {submittedBookings.length} Direct{" "}
              {submittedBookings.length === 1 ? "Request" : "Requests"}
            </span>
          </div>

          <div className="rows">
            {submittedBookings.map((bk, idx) => (
              <div key={bk.id} className="row">
                <span className="n">{String(idx + 1).padStart(2, "0")}</span>
                <div>
                  <h3>
                    <Link
                      href={`/listings/${bk.listingSlug}`}
                      className="no-underline hover:underline"
                    >
                      {bk.listingName}
                    </Link>
                  </h3>
                  <span className="text-xs text-[var(--muted)]">
                    {bk.packageName} · Ref #{bk.bookingCode || bk.id}
                  </span>
                </div>
                <span className="m a">
                  {bk.eventCategory} · {bk.eventDate}
                </span>
                <span className="m g">{bk.guestCount} guests</span>
                <span className="free">{bk.status}</span>
                <span className="p">{formatCurrency(bk.totalAmount)}</span>
                <button
                  type="button"
                  onClick={() => setSelectedContract(bk)}
                  className="btn"
                >
                  Inspect Terms
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Saved Shortlist */}
        <section className="mkt-section">
          <div className="head">
            <h2>Saved venues &amp; vendors</h2>
            <span className="label">{savedListings.length} Shortlisted</span>
          </div>

          {savedListings.length === 0 ? (
            <div className="rows">
              <div className="empty">
                No saved listings yet. Explore the marketplace to shortlist
                rooms.
              </div>
            </div>
          ) : (
            <div className="rows">
              {savedListings.map((item, idx) => (
                <div key={item.id} className="relative">
                  <ListingCard
                    listing={item}
                    displayIndex={idx}
                    variant="row"
                    onQuickBook={(l) => setQuickBookListing(l)}
                  />
                  <div className="pb-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => dispatch(toggleSavedListing(item.slug))}
                      className="text-xs underline text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                    >
                      Remove {item.name} from shortlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Direct Contract Dossier Modal */}
      {selectedContract && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedContract(null)}
        >
          <div
            className="max-w-lg w-full bg-[var(--bg)] text-[var(--ink)] border border-[var(--ink)] p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[var(--line)] pb-4">
              <div>
                <span className="label">
                  Direct Owner Agreement · #
                  {selectedContract.bookingCode || selectedContract.id}
                </span>
                <h3 className="text-3xl mt-1">
                  {selectedContract.listingName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContract(null)}
                className="btn !py-1 !px-3 text-xs"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-2 text-sm border-b border-[var(--line)] pb-4">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Status</span>
                <span className="font-medium">{selectedContract.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Event &amp; Date</span>
                <span>
                  {selectedContract.eventCategory} ·{" "}
                  {selectedContract.eventDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Package Tier</span>
                <span>{selectedContract.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Guest Count</span>
                <span>{selectedContract.guestCount} guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  Broker / Agency Commission
                </span>
                <span className="font-medium">$0 (0%)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--line)]">
                <span className="font-medium">Total Direct Price</span>
                <span className="serif text-2xl">
                  {formatCurrency(selectedContract.totalAmount)}
                </span>
              </div>
            </div>

            {selectedContract.notes && (
              <div className="bg-[var(--soft)] p-3 text-xs border border-[var(--line)]">
                <span className="label block mb-1">Your Planner Note</span>
                <p>“{selectedContract.notes}”</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                href={`/listings/${selectedContract.listingSlug}`}
                className="btn"
              >
                Open Venue Page
              </Link>
              {selectedContract.dbStatus !== "CANCELLED" && (
                <button
                  type="button"
                  onClick={() => {
                    statusMutation.mutate({
                      bookingId: selectedContract.id,
                      newStatus: "CANCELLED",
                    });
                    setSelectedContract(null);
                  }}
                  className="btn text-xs"
                >
                  Cancel &amp; Release Date
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <QuickBookModal
        listing={quickBookListing}
        onClose={() => setQuickBookListing(null)}
      />
    </main>
  );
}

export default function UserPlannerDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="wrap py-20">
          <span className="label">Loading Planner Portal...</span>
        </main>
      }
    >
      <UserPlannerContent />
    </Suspense>
  );
}
