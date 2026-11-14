"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Store,
  Trash2,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { toast } from "@/lib/toast";

interface AdminListingItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  kind: "venue" | "vendor";
  city: string;
  basePrice: number;
  isVerified: boolean;
  bookingsCount: number;
  createdAt: string;
}

interface AdminOwnerItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  ownerType: "Venue Owner" | "Vendor" | "Venue & Vendor";
  createdAt: string;
  listings: AdminListingItem[];
}

interface AdminDashboardClientProps {
  initialAuthenticated: boolean;
  initialAdminEmail?: string;
}

export function AdminDashboardClient({
  initialAuthenticated,
  initialAdminEmail = "",
}: AdminDashboardClientProps) {
  const queryClient = useQueryClient();
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [adminEmail, setAdminEmail] = useState(initialAdminEmail);

  // Login form state
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [owners, setOwners] = useState<AdminOwnerItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "venue" | "vendor">("all");

  // Confirmation states
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [confirmListingId, setConfirmListingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load admin overview");
      }
      setOwners(data.owners || []);
      if (data.adminEmail) setAdminEmail(data.adminEmail);
    } catch (err) {
      setDataError(
        err instanceof Error ? err.message : "Failed to load admin data"
      );
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchOverview();
    }
  }, [authenticated, fetchOverview]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || "Invalid admin credentials.");
        return;
      }
      setAuthenticated(true);
      setPasswordInput("");
      toast("Signed in to Admin Dashboard");
    } catch {
      setLoginError("Unable to reach server. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setOwners([]);
    setConfirmUserId(null);
    setConfirmListingId(null);
    toast("Signed out of Admin Dashboard");
  };

  const handleDeleteListing = async (listingId: string) => {
    setDeletingId(listingId);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete listing");
      }
      setOwners((prev) =>
        prev.map((owner) => ({
          ...owner,
          listings: owner.listings.filter((l) => l.id !== listingId),
        }))
      );
      setConfirmListingId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["listings"] }),
        queryClient.invalidateQueries({ queryKey: ["my-listings"] }),
      ]);
      toast("Listing deleted");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteOwner = async (userId: string) => {
    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete owner/vendor");
      }
      setOwners((prev) => prev.filter((owner) => owner.id !== userId));
      setConfirmUserId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["listings"] }),
        queryClient.invalidateQueries({ queryKey: ["my-listings"] }),
      ]);
      toast("Vendor / Venue Owner and all their listings deleted");
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "Failed to delete vendor or venue owner"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (!authenticated) {
    return (
      <main className="wrap py-20">
        <div className="max-w-md mx-auto border border-[var(--ink)] bg-[var(--bg)] p-8 space-y-6">
          <div className="space-y-2 border-b border-[var(--line)] pb-4">
            <span className="label flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              MG-Events Administration
            </span>
            <h1 className="text-3xl leading-tight">
              Login to Admin Dashboard
            </h1>
            <p className="text-xs text-[var(--muted)]">
              Enter your administrator Gmail and password to manage all vendors,
              venue owners, and listings.
            </p>
          </div>

          {loginError && (
            <div
              role="alert"
              className="border border-red-600 bg-[var(--soft)] p-3 text-xs text-red-600"
            >
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="border border-[var(--line)] p-3">
              <label className="label block" htmlFor="admin-email">
                Admin Gmail
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter admin Gmail"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full mt-1 bg-transparent text-sm outline-none"
              />
            </div>

            <div className="border border-[var(--line)] p-3">
              <label className="label block" htmlFor="admin-password">
                Admin Password
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="btn btn-filled w-full justify-center"
            >
              {loginLoading ? "Verifying..." : "Login to Admin Dashboard"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const totalOwners = owners.length;
  const allListings = owners.flatMap((o) => o.listings);
  const totalVenueListings = allListings.filter(
    (l) => l.kind === "venue"
  ).length;
  const totalVendorListings = allListings.filter(
    (l) => l.kind === "vendor"
  ).length;

  const filteredOwners = owners.filter((owner) => {
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "venue" &&
        (owner.ownerType === "Venue Owner" ||
          owner.ownerType === "Venue & Vendor" ||
          owner.listings.length === 0)) ||
      (typeFilter === "vendor" &&
        (owner.ownerType === "Vendor" ||
          owner.ownerType === "Venue & Vendor"));

    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesType;

    const matchesText =
      owner.fullName.toLowerCase().includes(q) ||
      owner.email.toLowerCase().includes(q) ||
      owner.listings.some(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );

    return matchesType && matchesText;
  });

  return (
    <main className="pt-12 pb-20">
      <div className="wrap space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[var(--ink)]">
          <div>
            <span className="label flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              MG-Events Admin Control · {adminEmail}
            </span>
            <h1 className="text-[clamp(36px,5vw,60px)] leading-[0.95] mt-2">
              Vendors, Venue Owners &amp; <i>Listings.</i>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={fetchOverview}
              disabled={loadingData}
              className="btn flex items-center gap-2"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-filled flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="prin border-b border-[var(--ink)]">
          <div>
            <span className="label block mb-2">Vendors &amp; Venue Owners</span>
            <b>{totalOwners}</b>
            <span>Registered host &amp; vendor accounts</span>
          </div>
          <div>
            <span className="label block mb-2">Venue Listings</span>
            <b>{totalVenueListings}</b>
            <span>Wedding halls, farm houses, rooftops &amp; manors</span>
          </div>
          <div>
            <span className="label block mb-2">Vendor Service Listings</span>
            <b>{totalVendorListings}</b>
            <span>Catering, photography, decor &amp; sound</span>
          </div>
          <div>
            <span className="label block mb-2">Total Active Listings</span>
            <b>{allListings.length}</b>
            <span>Live across the marketplace</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
          <div className="tabs">
            {(
              [
                { key: "all", label: "All Accounts" },
                { key: "venue", label: "Venue Owners" },
                { key: "vendor", label: "Vendors" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTypeFilter(tab.key)}
                className={`tab ${typeFilter === tab.key ? "on" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search owner, email, or listing..."
            className="border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none min-w-[260px]"
          />
        </div>

        {dataError && (
          <div
            role="alert"
            className="border border-red-600 bg-[var(--soft)] p-4 text-xs text-red-600"
          >
            {dataError}
          </div>
        )}

        {/* Owners & Vendors List */}
        {loadingData && owners.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--muted)]">
            Loading vendors and venue owners...
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="border border-[var(--line)] p-10 text-center space-y-2">
            <Users className="w-6 h-6 mx-auto text-[var(--muted)]" />
            <p className="text-sm text-[var(--muted)]">
              No vendors or venue owners match your current filter.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOwners.map((owner) => (
              <section
                key={owner.id}
                className="border border-[var(--ink)] bg-[var(--bg)] p-6 space-y-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--line)]">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[11px] uppercase tracking-[0.1em] border border-[var(--ink)] bg-[var(--soft)] font-medium">
                        {owner.ownerType}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {owner.listings.length}{" "}
                        {owner.listings.length === 1 ? "listing" : "listings"}
                      </span>
                    </div>
                    <h2 className="text-2xl font-medium">{owner.fullName}</h2>
                    <p className="text-xs text-[var(--muted)]">
                      {owner.email}
                      {owner.phone ? ` · ${owner.phone}` : ""} · Joined{" "}
                      {new Date(owner.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {confirmUserId === owner.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={deletingId === owner.id}
                          onClick={() => handleDeleteOwner(owner.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white border border-red-600 cursor-pointer"
                        >
                          {deletingId === owner.id
                            ? "Deleting..."
                            : "Confirm Delete Account"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmUserId(null)}
                          className="px-3 py-1.5 text-xs border border-[var(--line)] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmUserId(owner.id)}
                        className="px-3 py-1.5 text-xs font-medium border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete {owner.ownerType === "Vendor" ? "Vendor" : "Owner"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Owner's Listings */}
                {owner.listings.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] italic">
                    No listings published by this account yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {owner.listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="border border-[var(--line)] p-4 flex flex-col justify-between gap-3 bg-[var(--soft)]"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">
                              {listing.kind === "venue" ? (
                                <Building2 className="w-3 h-3" />
                              ) : (
                                <Store className="w-3 h-3" />
                              )}
                              {listing.category}
                            </span>
                            <span className="text-xs font-semibold">
                              {formatCurrency(listing.basePrice)}
                            </span>
                          </div>
                          <h3 className="text-lg font-medium leading-snug">
                            {listing.title}
                          </h3>
                          <p className="text-xs text-[var(--muted)]">
                            {listing.city} · {listing.bookingsCount}{" "}
                            {listing.bookingsCount === 1
                              ? "booking"
                              : "bookings"}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--line)]">
                          <Link
                            href={`/listings/${listing.slug}`}
                            className="text-xs underline text-[var(--ink)]"
                          >
                            View Listing →
                          </Link>

                          {confirmListingId === listing.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={deletingId === listing.id}
                                onClick={() => handleDeleteListing(listing.id)}
                                className="px-2.5 py-1 text-[11px] font-medium bg-red-600 text-white cursor-pointer"
                              >
                                {deletingId === listing.id
                                  ? "Deleting..."
                                  : "Confirm"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmListingId(null)}
                                className="px-2.5 py-1 text-[11px] border border-[var(--line)] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmListingId(listing.id)}
                              className="px-2.5 py-1 text-[11px] font-medium border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete Listing
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
