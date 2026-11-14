"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { useClerkAuthFlow } from "@/hooks/useClerkAuthFlow";
import { useBookings } from "@/hooks/queries";
import { useCreateListingModal } from "@/store/useCreateListingModal";
import { useFilterModal } from "@/store/useFilterListingModal";
import { ROLE_LABELS, isHostRole } from "@/lib/roles";
import {
  User,
  Building2,
  CalendarCheck,
  Sparkles,
  PlusCircle,
  Heart,
  SlidersHorizontal,
  LayoutDashboard,
  LogOut,
  FolderKanban,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "@/lib/toast";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export function MyAccountDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { signOut } = useClerk();
  const { user, isSignedIn, isLoaded, currentRole, authPending, startGoogleAuth } =
    useClerkAuthFlow();
  const { data: bookings = [] } = useBookings();
  const { open: openCreateListing } = useCreateListingModal();
  const { open: openFilter } = useFilterModal();

  const isHost = isSignedIn && isHostRole(currentRole);
  const pendingRequests = bookings.filter((b) => b.dbStatus === "PENDING");
  const pendingRequestsCount = pendingRequests.length;
  const totalRequestsCount = bookings.length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut({ redirectUrl: "/" });
    toast("Signed out successfully");
  };

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Member";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || "";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={isSignedIn ? "Open account menu" : "Sign in or register"}
        className={`h-9 rounded-full border transition-all cursor-pointer flex items-center gap-2 ${
          isSignedIn
            ? "pl-1 pr-3 border-[var(--ink)] bg-[var(--bg)] hover:bg-[var(--soft)]"
            : "w-9 justify-center border-[var(--line)] bg-[var(--bg)] hover:border-[var(--ink)] hover:bg-[var(--soft)]"
        }`}
      >
        {isSignedIn && user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={displayName}
            className="h-7 w-7 rounded-full object-cover border border-[var(--line)]"
          />
        ) : (
          <User size={16} className="text-[var(--ink)]" />
        )}
        {isSignedIn && (
          <span className="hidden sm:inline text-xs font-medium text-[var(--ink)] max-w-[110px] truncate">
            {displayName}
          </span>
        )}
        {isHost && pendingRequestsCount > 0 && (
          <span
            title={`${pendingRequestsCount} pending booking request(s)`}
            className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5A5F] text-white text-[10px] font-bold"
          >
            {pendingRequestsCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-80 rounded-xl border border-[var(--ink)] bg-[var(--bg)] text-[var(--ink)] shadow-2xl overflow-hidden">
          {!isLoaded ? (
            <div className="p-6 text-center text-xs text-[var(--muted)]">
              Loading account...
            </div>
          ) : !isSignedIn ? (
            /* SIGNED-OUT STATE: 3 Exact Requested Options */
            <div>
              <div className="px-4 py-3.5 border-b border-[var(--line)] bg-[var(--soft)]">
                <span className="label block">Welcome to MG—Events</span>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Sign in with Google or register as a venue owner or vendor.
                </p>
              </div>

              <div className="p-2 space-y-1">
                <button
                  type="button"
                  disabled={authPending !== null}
                  onClick={() => {
                    setOpen(false);
                    startGoogleAuth("PLANNER");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--soft)] text-left transition cursor-pointer"
                >
                  <div className="h-9 w-9 rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-center justify-center shrink-0">
                    <GoogleIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[var(--ink)]">
                      {authPending === "PLANNER"
                        ? "Connecting Google..."
                        : "Login using Google"}
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">
                      For normal users &amp; event planners
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-[var(--muted)]" />
                </button>

                <button
                  type="button"
                  disabled={authPending !== null}
                  onClick={() => {
                    setOpen(false);
                    startGoogleAuth("OWNER", "/dashboard/owner");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--soft)] text-left transition cursor-pointer"
                >
                  <div className="h-9 w-9 rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-[var(--ink)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[var(--ink)]">
                      {authPending === "OWNER"
                        ? "Setting up Owner..."
                        : "Register as a Venue Owner"}
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">
                      List spaces &amp; keep 100% of bookings
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-[var(--muted)]" />
                </button>

                <button
                  type="button"
                  disabled={authPending !== null}
                  onClick={() => {
                    setOpen(false);
                    startGoogleAuth("VENDOR", "/dashboard/owner");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--soft)] text-left transition cursor-pointer"
                >
                  <div className="h-9 w-9 rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="text-[var(--ink)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[var(--ink)]">
                      {authPending === "VENDOR"
                        ? "Setting up Vendor..."
                        : "Register as a Vendor"}
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">
                      Catering, Photography, Florals &amp; Sound
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-[var(--muted)]" />
                </button>
              </div>
            </div>
          ) : (
            /* SIGNED-IN STATE: Role-Adaptive Menu */
            <div>
              <div className="p-4 border-b border-[var(--line)] bg-[var(--soft)]">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--ink)] truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-[var(--muted)] truncate">
                      {displayEmail}
                    </p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[var(--ink)] text-[var(--bg)] rounded">
                    {ROLE_LABELS[currentRole]}
                  </span>
                </div>
              </div>

              <div className="p-2 space-y-0.5 text-sm">
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--soft)] no-underline transition"
                >
                  <User size={15} className="text-[var(--muted)]" />
                  <div>
                    <div className="font-medium text-xs">My Account</div>
                    <div className="text-[11px] text-[var(--muted)]">
                      Profile, role &amp; Google security
                    </div>
                  </div>
                </Link>

                {currentRole === "PLANNER" && (
                  <>
                    <Link
                      href="/dashboard/user"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--soft)] no-underline transition"
                    >
                      <CalendarCheck size={15} className="text-[var(--muted)]" />
                      <div>
                        <div className="font-medium text-xs">
                          My Bookings &amp; Budget
                        </div>
                        <div className="text-[11px] text-[var(--muted)]">
                          Direct agreements &amp; event dates
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard/user#saved"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--soft)] no-underline transition"
                    >
                      <Heart size={15} className="text-[#FF5A5F]" />
                      <div>
                        <div className="font-medium text-xs">Saved Shortlist</div>
                        <div className="text-[11px] text-[var(--muted)]">
                          Favorited venues &amp; vendors
                        </div>
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        openFilter();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--soft)] text-left transition cursor-pointer"
                    >
                      <SlidersHorizontal
                        size={15}
                        className="text-[var(--muted)]"
                      />
                      <div>
                        <div className="font-medium text-xs">Filter Listings</div>
                        <div className="text-[11px] text-[var(--muted)]">
                          Category, district map &amp; budget
                        </div>
                      </div>
                    </button>

                    <div className="my-1.5 border-t border-[var(--line)] pt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          startGoogleAuth("OWNER", "/dashboard/owner");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--soft)] text-left transition cursor-pointer"
                      >
                        <Building2 size={15} className="text-[var(--muted)]" />
                        <span className="text-xs font-medium">
                          Switch to Venue Owner
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          startGoogleAuth("VENDOR", "/dashboard/owner");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--soft)] text-left transition cursor-pointer"
                      >
                        <Sparkles size={15} className="text-[var(--muted)]" />
                        <span className="text-xs font-medium">
                          Switch to Service Vendor
                        </span>
                      </button>
                    </div>
                  </>
                )}

                {isHostRole(currentRole) && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        openCreateListing(
                          currentRole === "VENDOR" ? "vendor" : "venue"
                        );
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--soft)] text-left transition cursor-pointer"
                    >
                      <PlusCircle size={15} className="text-[#FF5A5F]" />
                      <div>
                        <div className="font-semibold text-xs">
                          {currentRole === "VENDOR"
                            ? "List a Vendor Service"
                            : "List a New Venue"}
                        </div>
                        <div className="text-[11px] text-[var(--muted)]">
                          6-step Airbnb listing wizard
                        </div>
                      </div>
                    </button>

                    <Link
                      href="/dashboard/owner#requests"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg hover:bg-[var(--soft)] no-underline transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CalendarCheck size={15} className="text-[#FF5A5F] shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-xs">
                            Booking Requests
                          </div>
                          <div className="text-[11px] text-[var(--muted)] truncate">
                            {totalRequestsCount === 0
                              ? "No requests yet"
                              : pendingRequestsCount > 0
                              ? `${pendingRequestsCount} pending · ${totalRequestsCount} total`
                              : `${totalRequestsCount} total requests`}
                          </div>
                        </div>
                      </div>
                      {pendingRequestsCount > 0 && (
                        <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#FF5A5F] text-white text-[10px] font-bold">
                          {pendingRequestsCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/properties"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--soft)] no-underline transition"
                    >
                      <FolderKanban size={15} className="text-[var(--muted)]" />
                      <div>
                        <div className="font-medium text-xs">
                          My Listings
                        </div>
                        <div className="text-[11px] text-[var(--muted)]">
                          Edit, update photos, or delete
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard/owner"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--soft)] no-underline transition"
                    >
                      <LayoutDashboard
                        size={15}
                        className="text-[var(--muted)]"
                      />
                      <div>
                        <div className="font-medium text-xs">
                          {currentRole === "VENDOR"
                            ? "Vendor Portal & Leads"
                            : "Owner Portal & Calendar"}
                        </div>
                        <div className="text-[11px] text-[var(--muted)]">
                          Confirm requests &amp; block dates
                        </div>
                      </div>
                    </Link>
                  </>
                )}
              </div>

              <div className="p-2.5 border-t border-[var(--line)] bg-[var(--soft)]">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--ink)] text-xs font-medium cursor-pointer transition"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
