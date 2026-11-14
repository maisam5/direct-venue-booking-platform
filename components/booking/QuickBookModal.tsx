"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Listing } from "@/types";
import { useAppDispatch } from "@/store";
import { hydrateDraftWithListing } from "@/store/slices/bookingDraftSlice";
import { DirectBookingForm } from "./DirectBookingForm";
import { VerificationBadge } from "@/components/marketplace/VerificationBadge";

interface QuickBookModalProps {
  listing: Listing | null;
  onClose: () => void;
}

export function QuickBookModal({ listing, onClose }: QuickBookModalProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (listing) {
      dispatch(hydrateDraftWithListing(listing));
    }
  }, [listing, dispatch]);

  if (!listing) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={`Direct booking drawer for ${listing.name}`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl h-full overflow-y-auto bg-[var(--bg)] text-[var(--ink)] border-l border-[var(--ink)] p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--ink)]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="label">
                {listing.indexNumber} · {listing.area}
              </span>
              <VerificationBadge verifiedDate={listing.verifiedDate} compact />
            </div>
            <h2 className="text-4xl leading-none">{listing.name}</h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              {listing.address} · Up to {listing.maxGuests} guests
            </p>
            {(listing.ownerEmail || listing.ownerPhone) && (
              <p className="text-xs text-[var(--ink)] mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                {listing.ownerEmail && <span>✉ {listing.ownerEmail}</span>}
                {listing.ownerPhone && <span>☎ {listing.ownerPhone}</span>}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn !py-1.5 !px-3 text-xs"
          >
            Close ✕
          </button>
        </div>

        {/* Architectural Preview Banner */}
        {listing.coverImage && (
          <div className="relative h-48 w-full overflow-hidden border border-[var(--line)] bg-[var(--block)]">
            <img
              src={listing.coverImage}
              alt={listing.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-[var(--bg)] px-2.5 py-1 text-xs border border-[var(--line)]">
              <span className="free">{listing.availabilityLabel}</span>
            </div>
            <Link
              href={`/listings/${listing.slug}`}
              onClick={onClose}
              className="absolute bottom-3 right-3 bg-[var(--ink)] text-[var(--bg)] px-3 py-1 text-xs no-underline hover:opacity-90"
            >
              Open Full Venue Page →
            </Link>
          </div>
        )}

        {/* Direct Booking Form */}
        <DirectBookingForm listing={listing} />
      </div>
    </div>
  );
}
