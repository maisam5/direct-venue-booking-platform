"use client";

import React from "react";
import Link from "next/link";
import { Listing } from "@/types";
import { formatCurrency } from "@/lib/format";
import HeartButton from "@/components/favorites/HeartButton";

interface ListingCardProps {
  listing: Listing;
  displayIndex?: number;
  variant?: "row" | "vrow" | "card";
  onQuickBook?: (listing: Listing) => void;
}

export function ListingCard({
  listing,
  displayIndex,
  variant = "row",
  onQuickBook,
}: ListingCardProps) {
  const indexStr =
    displayIndex !== undefined
      ? String(displayIndex + 1).padStart(2, "0")
      : listing.indexNumber;

  if (variant === "vrow") {
    return (
      <div className="vrow">
        <span className="label">
          {listing.vendorSpecialty ?? "Service"}
        </span>
        <b className="flex items-center gap-3">
          {listing.coverImage && (
            <img
              src={listing.coverImage}
              alt={listing.name}
              className="h-9 w-12 object-cover border border-[var(--line)] hidden sm:block"
            />
          )}
          <Link
            href={`/listings/${listing.slug}`}
            className="no-underline hover:underline"
          >
            {listing.name}
          </Link>
        </b>
        <span className="m">{listing.priceUnitLabel}</span>
        <div className="flex items-center justify-between gap-3">
          <span className="free">{listing.availabilityLabel}</span>
          <div className="flex items-center gap-2">
            {onQuickBook && (
              <button
                type="button"
                onClick={() => onQuickBook(listing)}
                className="btn !py-1.5 !px-3 !text-xs"
              >
                Book
              </button>
            )}
            <Link
              href={`/listings/${listing.slug}`}
              className="text-xs underline text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <article className="border border-[var(--line)] bg-[var(--bg)] flex flex-col justify-between transition-colors hover:bg-[var(--soft)] group">
        <div>
          {listing.coverImage && (
            <Link
              href={`/listings/${listing.slug}`}
              className="block relative h-56 w-full overflow-hidden bg-[var(--block)] border-b border-[var(--line)]"
            >
              <img
                src={listing.coverImage}
                alt={listing.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 bg-[var(--bg)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] border border-[var(--line)]">
                {indexStr} · {listing.area}
              </span>
              <div className="absolute top-3 right-3 z-10">
                <HeartButton
                  listingSlug={listing.slug}
                  listingId={listing.id}
                />
              </div>
              <span className="absolute bottom-3 left-3 bg-[var(--bg)] px-2.5 py-1 text-xs border border-[var(--line)]">
                <span className="free">{listing.availabilityLabel}</span>
              </span>
            </Link>
          )}

          <div className="p-6 pb-4">
            <Link
              href={`/listings/${listing.slug}`}
              className="no-underline"
            >
              <h3 className="text-[32px] leading-none mb-2 group-hover:underline">
                {listing.name}
              </h3>
            </Link>

            <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">
              {listing.shortSummary}
            </p>

            <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
              <span>Up to {listing.maxGuests} guests</span>
              <span>·</span>
              <span>{listing.categories.join(" / ")}</span>
              <span>·</span>
              <span>Owner: {listing.ownerName}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--line)] flex items-end justify-between gap-3">
          <div>
            <span className="label block">Direct Owner Price</span>
            <span className="serif text-[28px] leading-none">
              {listing.kind === "vendor" && listing.basePrice < 500
                ? listing.priceUnitLabel
                : formatCurrency(listing.basePrice)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onQuickBook ? (
              <button
                type="button"
                onClick={() => onQuickBook(listing)}
                className="btn"
              >
                Book directly
              </button>
            ) : (
              <Link className="btn" href={`/listings/${listing.slug}`}>
                Book directly
              </Link>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Default: Exact `.row` layout from MG-Events – Complete Design.html with subtle thumbnail + Quick Book
  return (
    <div className="row">
      <span className="n">{indexStr}</span>
      <div className="flex items-center gap-3.5">
        {listing.coverImage && (
          <Link
            href={`/listings/${listing.slug}`}
            className="hidden sm:block shrink-0 overflow-hidden border border-[var(--line)] bg-[var(--block)] h-11 w-16"
          >
            <img
              src={listing.coverImage}
              alt={listing.name}
              className="h-full w-full object-cover"
            />
          </Link>
        )}
        <div>
          <h3>
            <Link
              href={`/listings/${listing.slug}`}
              className="no-underline hover:underline"
            >
              {listing.name}
            </Link>
          </h3>
        </div>
      </div>
      <span className="m a">{listing.area}</span>
      <span className="m g">Up to {listing.maxGuests} guests</span>
      <span className="free">{listing.availabilityLabel}</span>
      <span className="p">{formatCurrency(listing.basePrice)}</span>
      {onQuickBook ? (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onQuickBook(listing)}
            className="btn w-full"
          >
            Book directly
          </button>
        </div>
      ) : (
        <Link className="btn" href={`/listings/${listing.slug}`}>
          Book directly
        </Link>
      )}
    </div>
  );
}
