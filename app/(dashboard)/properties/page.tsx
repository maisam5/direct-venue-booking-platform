"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useMyListings } from "@/hooks/queries";
import { useCreateListingModal } from "@/store/useCreateListingModal";
import { useClerkAuthFlow } from "@/hooks/useClerkAuthFlow";
import { isHostRole } from "@/lib/roles";
import useCountries from "@/custom-hooks/useCountries";
import { formatCurrency } from "@/lib/format";
import { Listing } from "@/types";
import {
  PlusCircle,
  MapPin,
  Pencil,
  Trash2,
  Mail,
  Phone,
  ExternalLink,
  Images,
} from "lucide-react";

export default function MyListingsPage() {
  const queryClient = useQueryClient();
  const { isSignedIn, currentRole, startGoogleAuth } = useClerkAuthFlow();
  const canManageListings = Boolean(isSignedIn && isHostRole(currentRole));

  const { data: listings = [], isLoading } = useMyListings(canManageListings);
  const { open: openCreateListing, openEdit } = useCreateListingModal();
  const { getByValue } = useCountries();

  const [kindTab, setKindTab] = useState<"all" | "venue" | "vendor">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = listings.filter((item) =>
    kindTab === "all" ? true : item.kind === kindTab
  );

  const handleDelete = async (listing: Listing) => {
    const confirmed = window.confirm(
      `Delete "${listing.name}"? This will remove the listing and its bookings permanently.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(listing.id);
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "DELETE",
      });
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        toast(payload.error || "Failed to delete listing.", {
          style: { background: "#FF5A5F", color: "white" },
        });
        return;
      }
      toast("Listing deleted.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-listings"] }),
        queryClient.invalidateQueries({ queryKey: ["listings"] }),
      ]);
    } catch {
      toast("Failed to delete listing.", {
        style: { background: "#FF5A5F", color: "white" },
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="pt-12 pb-20">
      <div className="wrap space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[var(--ink)]">
          <div>
            <span className="label">
              My Listings · Role: {currentRole}
            </span>
            <h1 className="text-[clamp(40px,5.5vw,72px)] leading-[0.95] mt-2">
              Manage your <i>listings.</i>
            </h1>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-2xl">
              Only listings created by your account appear here. Update details,
              contact information, photos (3–5 required), or remove a listing at
              any time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canManageListings ? (
              <>
                <Link href="/dashboard/owner#requests" className="btn">
                  Booking Requests
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    openCreateListing(
                      currentRole === "VENDOR" ? "vendor" : "venue"
                    )
                  }
                  className="btn btn-filled flex items-center gap-2"
                >
                  <PlusCircle size={15} />
                  <span>+ Create New Listing</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => startGoogleAuth("OWNER", "/properties")}
                  className="btn btn-filled"
                >
                  Register as Venue Owner
                </button>
                <button
                  type="button"
                  onClick={() => startGoogleAuth("VENDOR", "/properties")}
                  className="btn"
                >
                  Register as Vendor
                </button>
              </>
            )}
          </div>
        </div>

        {!canManageListings ? (
          <div className="border border-[var(--line)] rounded-2xl p-10 text-center space-y-4 bg-[var(--soft)]">
            <span className="label block">Host Access Required</span>
            <h2 className="text-2xl font-serif">
              Sign in as a Venue Owner or Vendor to manage your listings
            </h2>
            <p className="text-sm text-[var(--muted)] max-w-lg mx-auto">
              Each Venue Owner and Vendor has a private workspace to create,
              update, and delete their own listings and review incoming booking
              requests.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => startGoogleAuth("OWNER", "/properties")}
                className="btn btn-filled"
              >
                Continue with Google · Venue Owner
              </button>
              <button
                type="button"
                onClick={() => startGoogleAuth("VENDOR", "/properties")}
                className="btn"
              >
                Continue with Google · Vendor
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Kind Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="tabs">
                {(["all", "venue", "vendor"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKindTab(k)}
                    className={`tab ${kindTab === k ? "on" : ""}`}
                  >
                    {k === "all"
                      ? `My Listings (${listings.length})`
                      : k === "venue"
                      ? `Venues (${listings.filter((l) => l.kind === "venue").length})`
                      : `Vendors (${listings.filter((l) => l.kind === "vendor").length})`}
                  </button>
                ))}
              </div>
              <span className="text-xs text-[var(--muted)]">
                Showing only listings created by your account
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-80 rounded-2xl border border-[var(--line)] bg-[var(--soft)] animate-pulse"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-dashed border-[var(--line)] rounded-2xl p-12 text-center space-y-4">
                <p className="text-lg font-serif">
                  You haven&apos;t created any{" "}
                  {kindTab === "all" ? "listings" : `${kindTab}s`} yet.
                </p>
                <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
                  Publish your venue or vendor service with 3–5 photos and your
                  direct email and phone number so planners can book you.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    openCreateListing(
                      currentRole === "VENDOR" ? "vendor" : "venue"
                    )
                  }
                  className="btn btn-filled inline-flex items-center gap-2"
                >
                  <PlusCircle size={15} />
                  <span>Create Your First Listing</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((listing) => {
                  const location = getByValue(listing.area);
                  const photoCount = listing.galleryImages?.length || 1;
                  return (
                    <div
                      key={listing.id}
                      className="border border-[var(--line)] rounded-2xl p-4 bg-[var(--bg)] flex flex-col justify-between gap-4 hover:border-[var(--ink)] transition"
                    >
                      <div className="space-y-3">
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[var(--soft)]">
                          <Link href={`/listings/${listing.slug}`}>
                            <img
                              src={
                                listing.coverImage ||
                                "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80"
                              }
                              alt={listing.name}
                              className="w-full h-full object-cover"
                            />
                          </Link>
                          <span className="absolute top-3 left-3 bg-[var(--bg)]/90 text-[var(--ink)] px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                            {listing.kind === "venue"
                              ? "Venue"
                              : listing.vendorSpecialty || "Vendor"}
                          </span>
                          <span className="absolute top-3 right-3 bg-black/70 text-white px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1">
                            <Images size={11} />
                            {photoCount} photos
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[var(--muted)] text-xs flex items-center gap-1">
                            <MapPin size={12} />
                            {location
                              ? `${location.label}, ${location.region}`
                              : listing.area}
                          </p>
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/listings/${listing.slug}`}
                              className="font-semibold text-base text-[var(--ink)] hover:underline truncate"
                            >
                              {listing.name}
                            </Link>
                            <Link
                              href={`/listings/${listing.slug}`}
                              className="text-[var(--muted)] hover:text-[var(--ink)] shrink-0"
                              title="View live listing"
                            >
                              <ExternalLink size={14} />
                            </Link>
                          </div>
                          <p className="text-xs text-[var(--muted)]">
                            Up to {listing.maxGuests} guests ·{" "}
                            {formatCurrency(listing.basePrice)} /{" "}
                            {listing.kind === "vendor" ? "service" : "event"}
                          </p>

                          <div className="pt-2 border-t border-[var(--line)] space-y-1 text-xs text-[var(--muted)]">
                            {listing.ownerEmail && (
                              <p className="flex items-center gap-1.5 truncate">
                                <Mail size={12} className="shrink-0" />
                                <span className="truncate">
                                  {listing.ownerEmail}
                                </span>
                              </p>
                            )}
                            {listing.ownerPhone && (
                              <p className="flex items-center gap-1.5 truncate">
                                <Phone size={12} className="shrink-0" />
                                <span>{listing.ownerPhone}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[var(--line)] flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(listing)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--soft)] transition cursor-pointer"
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === listing.id}
                          onClick={() => handleDelete(listing)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          <span>
                            {deletingId === listing.id ? "Deleting..." : "Delete"}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
