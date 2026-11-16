"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  hydrateDraftWithListing,
  selectPackageTier,
  setDraftEventDate,
  toggleSavedListing,
} from "@/store/slices/bookingDraftSlice";
import {
  useMarketplaceListings,
  useListingAvailability,
} from "@/hooks/queries";
import { formatCurrency } from "@/lib/format";
import { VerificationBadge } from "@/components/marketplace/VerificationBadge";
import { AvailabilityCalendar } from "@/components/marketplace/AvailabilityCalendar";
import { DirectBookingForm } from "@/components/booking/DirectBookingForm";
import ListingViewMap from "@/components/listings/ListingViewMap";

function ListingDetailContent() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "harbor-hall";
  const dispatch = useAppDispatch();

  const { data: listings = [] } = useMarketplaceListings();
  const { savedSlugs, eventDate, selectedPackageId } = useAppSelector(
    (state) => state.bookingDraft
  );

  const listing =
    listings.find((l) => l.slug === slug) ?? listings[0];

  const { data: liveSlots } = useListingAvailability(
    listing?.id ?? "",
    "2026-12",
    listing?.availability
  );

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reviews, setReviews] = useState<
    Array<{
      id: string;
      author: string;
      event: string;
      rating: number;
      date: string;
      comment: string;
    }>
  >([]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewText, setNewReviewText] = useState("");

  useEffect(() => {
    if (listing) {
      dispatch(hydrateDraftWithListing(listing));
      setActivePhotoIndex(0);
    }
  }, [listing?.id, dispatch]);

  if (!listing) {
    return (
      <main className="wrap py-20">
        <span className="label">404 · Not Found</span>
        <h1 className="text-5xl mt-3 mb-6">Listing not found.</h1>
        <Link href="/explore" className="btn">
          Return to Marketplace
        </Link>
      </main>
    );
  }

  const isSaved = savedSlugs.includes(listing.slug);
  const calendarSlots = liveSlots ?? listing.availability;
  const photos =
    listing.galleryImages && listing.galleryImages.length > 0
      ? listing.galleryImages
      : listing.coverImage
      ? [listing.coverImage]
      : [];
  const activePhotoUrl = photos[activePhotoIndex] ?? photos[0];

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setReviews((prev) => [
      {
        id: `rev-${Date.now()}`,
        author: newReviewName.trim() || "Verified Event Planner",
        event: `${listing.categories[0] ?? "Private Event"} · Verified Booking`,
        rating: 5,
        date: "Nov 2026",
        comment: newReviewText.trim(),
      },
      ...prev,
    ]);
    setNewReviewName("");
    setNewReviewText("");
  };

  return (
    <main className="pt-12">
      <div className="wrap">
        {/* Top Breadcrumb & Verification */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/explore"
              className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] no-underline hover:text-[var(--ink)]"
            >
              ← All {listing.kind === "venue" ? "Venues" : "Vendors"}
            </Link>
            <span className="text-[var(--line)]">/</span>
            <span className="label">
              {listing.indexNumber} · {listing.area}
            </span>
            <VerificationBadge verifiedDate={listing.verifiedDate} />
          </div>

          <div className="flex items-center gap-2.5">
            {photos.length > 0 && (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="btn !py-2 !px-4"
              >
                Inspect Photos ({photos.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => dispatch(toggleSavedListing(listing.slug))}
              className={`btn !py-2 !px-4 ${isSaved ? "btn-filled" : ""}`}
            >
              {isSaved ? "Saved to Planner" : "Save Listing"}
            </button>
          </div>
        </div>

        {/* Hero Title & Architectural Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-10 border-b border-[var(--ink)] items-end">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="free">{listing.availabilityLabel}</span>
              <span className="text-[var(--line)]">·</span>
              <span className="label">
                {listing.categories.join(" · ")} · Up to {listing.maxGuests}{" "}
                guests
              </span>
            </div>

            <h1 className="text-[clamp(48px,7vw,96px)] leading-[0.92]">
              {listing.name}
            </h1>

            <p className="text-base text-[var(--muted)] max-w-2xl">
              {listing.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--line)]">
              <div>
                <span className="label block">Direct Owner / Host</span>
                <p className="serif text-2xl mt-0.5">{listing.ownerName}</p>
                <span className="text-xs text-[var(--muted)] block">
                  {listing.ownerRole}
                </span>
                {(listing.ownerEmail || listing.ownerPhone) && (
                  <div className="mt-2 space-y-0.5 text-xs">
                    {listing.ownerEmail && (
                      <a
                        href={`mailto:${listing.ownerEmail}`}
                        className="block text-[var(--ink)] underline break-all"
                      >
                        {listing.ownerEmail}
                      </a>
                    )}
                    {listing.ownerPhone && (
                      <a
                        href={`tel:${listing.ownerPhone}`}
                        className="block text-[var(--ink)] underline"
                      >
                        {listing.ownerPhone}
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div>
                <span className="label block">Dimensions &amp; Spec</span>
                <p className="text-sm mt-1">{listing.dimensions}</p>
                <span className="text-xs text-[var(--muted)]">
                  {listing.address}
                </span>
              </div>
              <div>
                <span className="label block">Broker Commission</span>
                <p className="serif text-2xl mt-0.5">0% ($0)</p>
                <span className="text-xs text-[var(--muted)]">
                  Direct owner contract
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div className="relative h-[360px] sm:h-[430px] w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--soft)] group select-none flex items-center justify-center">
              {activePhotoUrl ? (
                <>
                  {/* Soft ambient backdrop so any aspect ratio looks full without cropping */}
                  <img
                    src={activePhotoUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover blur-xl opacity-30 scale-110 pointer-events-none"
                  />
                  <img
                    src={activePhotoUrl}
                    alt={`${listing.name} — Photo ${activePhotoIndex + 1}`}
                    onClick={() => setLightboxOpen(true)}
                    className="relative z-10 max-h-full max-w-full h-full w-full object-contain cursor-pointer transition-transform duration-300"
                  />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted)]">
                  No photos available
                </div>
              )}

              {/* Top badges: counter + fullscreen */}
              {photos.length > 0 && (
                <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
                  <span className="bg-black/75 text-white text-xs font-medium px-3 py-1 rounded-full">
                    {activePhotoIndex + 1} / {photos.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    aria-label="View fullscreen"
                    className="pointer-events-auto h-8 w-8 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-black transition cursor-pointer"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              )}

              {/* Left / Right Slider Controls */}
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex(
                        (prev) => (prev - 1 + photos.length) % photos.length
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-black transition shadow-md cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex((prev) => (prev + 1) % photos.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-black transition shadow-md cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Bottom Dot Indicators */}
              {photos.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Go to photo ${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activePhotoIndex === idx
                          ? "w-6 bg-white shadow"
                          : "w-2 bg-white/60 hover:bg-white/90"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {photos.map((url, idx) => {
                  const isActive = activePhotoIndex === idx;
                  return (
                    <button
                      key={`${url}-${idx}`}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative h-16 sm:h-20 rounded-lg overflow-hidden border-2 bg-[var(--soft)] transition cursor-pointer ${
                        isActive
                          ? "border-[var(--ink)] ring-1 ring-[var(--ink)]"
                          : "border-[var(--line)] opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${listing.name} thumbnail ${idx + 1}`}
                        className="h-full w-full object-contain bg-[var(--soft)]"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main 2-Column Split: Packages, Calendar & Reviews (Left) + Direct Booking Widget (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 items-start">
          <div className="lg:col-span-7 space-y-14">
            {/* Packages Section */}
            <section>
              <div className="head">
                <h2>Transparent owner packages</h2>
                <span className="label">No hidden service percentages</span>
              </div>

              <div className="rows">
                {listing.packages.map((pkg, idx) => {
                  const isCurrent = selectedPackageId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      className={`py-6 px-4 border-b border-[var(--line)] transition-colors ${
                        isCurrent ? "bg-[var(--soft)]" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-4">
                        <div>
                          <span className="label">
                            Tier 0{idx + 1} · Up to {pkg.maxGuests} guests
                          </span>
                          <h3 className="text-[32px] leading-tight mt-1">
                            {pkg.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="serif text-[32px] leading-none">
                            {formatCurrency(pkg.price)}
                          </span>
                          <span className="label block">
                            {pkg.priceType === "per_guest"
                              ? "Per Guest · 0% Markup"
                              : "Flat Owner Rate"}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-[var(--muted)] mt-2 mb-4">
                        {pkg.description}
                      </p>

                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--ink)] mb-4">
                        {pkg.includedFeatures.map((feat) => (
                          <li key={feat} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)]" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        onClick={() => dispatch(selectPackageTier(pkg.id))}
                        className={`btn ${isCurrent ? "btn-filled" : ""}`}
                      >
                        {isCurrent
                          ? "Selected in Booking Draft"
                          : "Select Package"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Interactive Availability Calendar */}
            <section>
              <div className="head">
                <h2>Live availability</h2>
                <span className="label">
                  Selected Date: {eventDate || "Choose below"}
                </span>
              </div>

              <AvailabilityCalendar
                slots={calendarSlots}
                selectedDate={eventDate}
                onSelectDate={(dateStr) => dispatch(setDraftEventDate(dateStr))}
              />
            </section>

            {/* Interactive Location Map (ListingViewMap) */}
            <section>
              <div className="head">
                <h2>Location &amp; district map</h2>
                <span className="label">
                  {listing.area} · {listing.address}
                </span>
              </div>
              <ListingViewMap
                price={listing.basePrice}
                locationValue={listing.area}
              />
            </section>

            {/* Verified Guest Reviews */}
            <section>
              <div className="head">
                <h2>Verified direct bookings</h2>
                <span className="label">
                  {reviews.length} Verified Planner Reviews
                </span>
              </div>

              <div className="rows">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="py-6 border-b border-[var(--line)] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="label">
                        {rev.author} · {rev.event}
                      </span>
                      <span className="text-xs font-medium">
                        {"★".repeat(rev.rating)} · {rev.date}
                      </span>
                    </div>
                    <p className="serif text-2xl leading-snug">
                      “{rev.comment}”
                    </p>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleAddReview}
                className="mt-6 border border-[var(--line)] bg-[var(--soft)] p-5 space-y-3"
              >
                <span className="label block">
                  Hosted an event at {listing.name}? Share your direct-booking
                  experience
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="Your Name & Event Type..."
                    className="border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
                  />
                  <input
                    type="text"
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="How much did you save booking directly with the owner?"
                    className="sm:col-span-2 border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
                  />
                </div>
                <button type="submit" className="btn !py-2 !px-4 text-xs">
                  Publish Verified Note
                </button>
              </form>
            </section>
          </div>

          {/* Sticky Direct Booking Widget */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <DirectBookingForm listing={listing} />
          </aside>
        </div>
      </div>

      {/* Fullscreen Architectural Lightbox */}
      {lightboxOpen && activePhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="max-w-4xl w-full bg-[var(--bg)] border border-[var(--ink)] p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="label">
                {listing.name} · Photo {activePhotoIndex + 1} of {photos.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="btn !py-1 !px-3 text-xs"
              >
                Close ✕
              </button>
            </div>
            <img
              src={activePhotoUrl}
              alt={listing.name}
              className="w-full max-h-[75vh] object-contain bg-[var(--soft)] border border-[var(--line)]"
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setActivePhotoIndex(
                    (prev) => (prev - 1 + photos.length) % photos.length
                  )
                }
                className="btn !py-1.5 !px-3 text-xs"
              >
                ← Previous
              </button>
              <span className="text-xs text-[var(--muted)]">
                {listing.galleryCaptions[activePhotoIndex]?.note ??
                  listing.architecturalNotes}
              </span>
              <button
                type="button"
                onClick={() =>
                  setActivePhotoIndex((prev) => (prev + 1) % photos.length)
                }
                className="btn !py-1.5 !px-3 text-xs"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ListingDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="wrap py-20">
          <span className="label">Loading Venue Dossier...</span>
        </main>
      }
    >
      <ListingDetailContent />
    </Suspense>
  );
}
