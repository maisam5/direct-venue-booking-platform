"use client";

import React from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { useClerkAuthFlow } from "@/hooks/useClerkAuthFlow";
import { useCreateListingModal } from "@/store/useCreateListingModal";
import { useFilterModal } from "@/store/useFilterListingModal";
import { useBookings, useMarketplaceListings } from "@/hooks/queries";
import { SelfServeRole, ROLE_LABELS, isHostRole } from "@/lib/roles";
import {
  Building2,
  CalendarCheck,
  Sparkles,
  PlusCircle,
  Heart,
  SlidersHorizontal,
  LayoutDashboard,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";

export default function MyAccountPage() {
  const { openUserProfile } = useClerk();
  const { user, isSignedIn, isLoaded, currentRole, authPending, startGoogleAuth } =
    useClerkAuthFlow();
  const { open: openCreateListing } = useCreateListingModal();
  const { open: openFilter } = useFilterModal();
  const { data: bookings = [] } = useBookings();
  const { data: listings = [] } = useMarketplaceListings();

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Member";

  const displayEmail = user?.primaryEmailAddress?.emailAddress || "";

  const venuesCount = listings.filter((l) => l.kind === "venue").length;
  const vendorsCount = listings.filter((l) => l.kind === "vendor").length;

  if (isLoaded && !isSignedIn) {
    return (
      <main className="wrap py-20">
        <div className="max-w-xl border border-[var(--ink)] bg-[var(--bg)] p-8 space-y-5">
          <span className="label block">MG—Events · Clerk Google Auth</span>
          <h1 className="text-4xl leading-tight">Sign in or register</h1>
          <p className="text-sm text-[var(--muted)]">
            Choose how you want to use MG—Events: book venues as a planner, or
            register as a Venue Owner or Service Vendor.
          </p>
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              disabled={authPending !== null}
              onClick={() => startGoogleAuth("PLANNER", "/account")}
              className="btn btn-filled w-full"
            >
              Login using Google (Normal User)
            </button>
            <button
              type="button"
              disabled={authPending !== null}
              onClick={() => startGoogleAuth("OWNER", "/dashboard/owner")}
              className="btn w-full"
            >
              Register as a Venue Owner
            </button>
            <button
              type="button"
              disabled={authPending !== null}
              onClick={() => startGoogleAuth("VENDOR", "/dashboard/owner")}
              className="btn w-full"
            >
              Register as a Vendor
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-12 pb-20">
      <div className="wrap space-y-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-[var(--ink)]">
          <div>
            <span className="label flex items-center gap-2">
              <ShieldCheck size={14} /> Clerk Auth &amp; Google OAuth ·{" "}
              {ROLE_LABELS[currentRole]}
            </span>
            <h1 className="text-[clamp(40px,5.5vw,72px)] leading-[0.95] mt-2">
              My Account · <i>{displayName}</i>
            </h1>
            {displayEmail && (
              <p className="text-sm text-[var(--muted)] mt-2">
                {displayEmail} · Active role:{" "}
                <strong className="text-[var(--ink)]">
                  {ROLE_LABELS[currentRole]}
                </strong>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {isLoaded && isSignedIn && (
              <button
                type="button"
                onClick={() => openUserProfile()}
                className="btn"
              >
                Google &amp; Security Profile
              </button>
            )}
            {isHostRole(currentRole) && (
              <button
                type="button"
                onClick={() =>
                  openCreateListing(
                    currentRole === "VENDOR" ? "vendor" : "venue"
                  )
                }
                className="btn btn-filled"
              >
                <PlusCircle size={15} />
                <span>
                  {currentRole === "VENDOR"
                    ? "List a Service"
                    : "List a Venue"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Role Overview & Upgrade Options */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="label">
              Account Role &amp; Capabilities (Verified via Clerk)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                {
                  role: "PLANNER" as SelfServeRole,
                  title: "User / Event Planner",
                  desc: "Browse venues & vendors, filter with Airbnb map, shortlist favorites, and book directly with 0% commission.",
                  icon: CalendarCheck,
                  badge: `${bookings.length} Bookings`,
                },
                {
                  role: "OWNER" as SelfServeRole,
                  title: "Venue Owner",
                  desc: "Publish your event space using the 6-step Airbnb listing wizard, manage your live calendar, and keep 100% of payouts.",
                  icon: Building2,
                  badge: `${venuesCount} Live Venues`,
                },
                {
                  role: "VENDOR" as SelfServeRole,
                  title: "Service Vendor",
                  desc: "List catering, photography, floral decor, or sound packages, respond to direct client leads, and manage event dates.",
                  icon: Sparkles,
                  badge: `${vendorsCount} Live Vendors`,
                },
              ] as const
            ).map((card) => {
              const Icon = card.icon;
              const active = currentRole === card.role;
              const canUpgrade =
                currentRole === "PLANNER" && card.role !== "PLANNER";

              return (
                <div
                  key={card.role}
                  className={`p-6 rounded-xl border-2 text-left flex flex-col justify-between gap-4 ${
                    active
                      ? "border-[var(--ink)] bg-[var(--soft)] shadow-md"
                      : "border-[var(--line)] bg-[var(--bg)]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon size={24} className="text-[var(--ink)]" />
                    <span
                      className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded font-semibold ${
                        active
                          ? "bg-[#FF5A5F] text-white"
                          : "bg-[var(--soft)] text-[var(--muted)] border border-[var(--line)]"
                      }`}
                    >
                      {active ? "Active Role" : card.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl leading-tight">{card.title}</h3>
                    <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  {canUpgrade && (
                    <button
                      type="button"
                      disabled={authPending !== null}
                      onClick={() =>
                        startGoogleAuth(card.role, "/dashboard/owner")
                      }
                      className="btn btn-filled w-full text-xs"
                    >
                      {authPending === card.role
                        ? "Upgrading..."
                        : `Register as ${card.title}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Role-Specific Action Cards */}
        <section className="space-y-4">
          <div className="head">
            <h2>
              {currentRole === "PLANNER"
                ? "User / Event Planner Options"
                : currentRole === "OWNER"
                ? "Venue Owner Options"
                : "Vendor Studio Options"}
            </h2>
            <span className="label">
              Tailored for your {ROLE_LABELS[currentRole].toLowerCase()} account
            </span>
          </div>

          {currentRole === "PLANNER" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-[var(--line)] bg-[var(--bg)] p-6 rounded-xl flex flex-col justify-between gap-4">
                <div>
                  <CalendarCheck size={24} className="text-[#FF5A5F] mb-3" />
                  <h3 className="text-3xl">My Direct Bookings</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    You have {bookings.length} direct booking agreements with
                    zero broker commission.
                  </p>
                </div>
                <Link href="/dashboard/user" className="btn w-full">
                  Open Planner Portal
                </Link>
              </div>

              <div className="border border-[var(--line)] bg-[var(--bg)] p-6 rounded-xl flex flex-col justify-between gap-4">
                <div>
                  <Heart size={24} className="text-[#FF5A5F] mb-3" />
                  <h3 className="text-3xl">Saved Shortlist</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Compare your favorited venues and vendors side by side before
                    locking your date.
                  </p>
                </div>
                <Link href="/dashboard/user#saved" className="btn w-full">
                  View Saved Favorites
                </Link>
              </div>

              <div className="border border-[var(--line)] bg-[var(--bg)] p-6 rounded-xl flex flex-col justify-between gap-4">
                <div>
                  <SlidersHorizontal
                    size={24}
                    className="text-[#FF5A5F] mb-3"
                  />
                  <h3 className="text-3xl">Airbnb-Style Filter</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Filter rooms and vendors by category, interactive map
                    district, and min/max price.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openFilter()}
                  className="btn w-full"
                >
                  Open Filter Modal
                </button>
              </div>
            </div>
          )}

          {currentRole === "OWNER" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-2 border-[var(--ink)] bg-[var(--soft)] p-6 rounded-xl flex flex-col justify-between gap-4">
                <div>
                  <PlusCircle size={24} className="text-[#FF5A5F] mb-3" />
                  <h3 className="text-3xl">Create Venue Listing</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Launch the 6-step Airbnb listing wizard: Category, Location
                    Map, Guest/Room Counters, Details, Photos &amp; Price.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openCreateListing("venue")}
                  className="btn btn-filled w-full"
                >
                  + List a Venue Now
                </button>
              </div>

              <div className="border border-[var(--line)] bg-[var(--bg)] p-6 rounded-xl flex flex-col justify-between gap-4">
                <div>
                  <Building2 size={24} className="text-[var(--ink)] mb-3" />
                  <h3 className="text-3xl">My Properties ({venuesCount})</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Inspect your live venue listings, pricing, and verified
                    location maps.
                  </p>
                </div>
                <Link href="/properties" className="btn w-full">
                  Manage Properties
                </Link>
              </div>

              <div className="border border-[var(--line)] bg-[var(--bg)] p-6 rounded-xl flex flex-col justify-between gap-4">
                <div>
                  <LayoutDashboard
                    size={24}
                    className="text-[var(--ink)] mb-3"
                  />
                  <h3 className="text-3xl">Booking Requests &amp; Calendar</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Confirm or decline incoming event requests and manage blocked
                    dates.
                  </p>
                </div>
                <Link href="/dashboard/owner" className="btn w-full">
                  Open Owner Portal
                </Link>
              </div>
            </div>
          )}

          {currentRole === "VENDOR" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-2 border-[var(--ink)] bg-[var(--soft)] p-6 rounded-xl flex flex-col justify-between gap-4">
                <div>
                  <Sparkles size={24} className="text-[#FF5A5F] mb-3" />
                  <h3 className="text-3xl">List Vendor Service</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Use the 6-step listing builder to publish Catering,
                    Photography, Florals &amp; Decor, or Live Sound packages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openCreateListing("vendor")}
                  className="btn btn-filled w-full"
                >
                  + List Vendor Service
                </button>
              </div>

              <div className="border border-[var(--line)] bg-[var(--bg)] p-6 rounded-xl flex flex-col justify-between gap-4">
                <div>
                  <FolderKanban size={24} className="text-[var(--ink)] mb-3" />
                  <h3 className="text-3xl">
                    My Vendor Listings ({vendorsCount})
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    View and update your live culinary, photography, floral, and
                    audio packages.
                  </p>
                </div>
                <Link href="/properties?kind=vendor" className="btn w-full">
                  View Vendor Listings
                </Link>
              </div>

              <div className="border border-[var(--line)] bg-[var(--bg)] p-6 rounded-xl flex flex-col justify-between gap-4">
                <div>
                  <LayoutDashboard
                    size={24}
                    className="text-[var(--ink)] mb-3"
                  />
                  <h3 className="text-3xl">Client Leads &amp; Schedule</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Review direct inquiries from event planners and lock your
                    service calendar.
                  </p>
                </div>
                <Link href="/dashboard/owner" className="btn w-full">
                  Open Vendor Dashboard
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
