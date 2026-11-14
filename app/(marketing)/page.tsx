"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCategory, setMaxBudget } from "@/store/slices/filterSlice";
import { EventCategory, Listing } from "@/types";
import { useMarketplaceListings } from "@/hooks/queries";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { QuickBookModal } from "@/components/booking/QuickBookModal";
import { formatCurrency } from "@/lib/format";
import { useCreateListingModal } from "@/store/useCreateListingModal";

const CATEGORY_TABS: { label: string; value: EventCategory }[] = [
  { label: "All", value: "all" },
  { label: "Wedding", value: "Wedding" },
  { label: "Birthday", value: "Birthday" },
  { label: "Corporate", value: "Corporate" },
];

function matchesGuestFilter(maxGuests: number, guestRange: string): boolean {
  if (!guestRange || guestRange === "any" || guestRange === "Up to 50") {
    return true;
  }
  if (guestRange === "50–150") return maxGuests >= 90;
  if (guestRange === "150–300") return maxGuests >= 150;
  if (guestRange === "300+") return maxGuests >= 300;
  return true;
}

export default function MarketingLandingPage() {
  const dispatch = useAppDispatch();
  const { open: openCreateListing } = useCreateListingModal();
  const { category, maxBudget, selectedDate, guestRange } = useAppSelector(
    (state) => state.filters
  );
  const { data: allListings = [] } = useMarketplaceListings();

  const [quickBookListing, setQuickBookListing] = useState<Listing | null>(
    null
  );

  const venues = allListings.filter((item) => item.kind === "venue");
  const vendors = allListings.filter((item) => item.kind === "vendor");

  const filteredVenues = venues.filter((v) => {
    const matchesBudget = v.basePrice <= maxBudget;
    const matchesCategory =
      category === "all" || v.categories.includes(category);
    const matchesGuests = matchesGuestFilter(v.maxGuests, guestRange);
    const matchesDate =
      !selectedDate ||
      !v.availability.some(
        (s) => s.date === selectedDate && s.status !== "available"
      );
    return matchesBudget && matchesCategory && matchesGuests && matchesDate;
  });

  return (
    <main id="top">
      {/* Hero + Budget Search Bar */}
      <section className="hero" style={{ paddingTop: 64 }}>
        <div className="wrap wrap-hero">
          <div>
            <span className="label">Direct booking · No commission</span>
            <h1>
              Book the room, <i>not the middleman.</i>
            </h1>
            <p>
              Set a budget, browse verified venues and vendors with live
              availability, and book straight with the owner. The price you see
              is the price you pay.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#venues" className="btn btn-filled">
                Browse {filteredVenues.length} Open Venues
              </a>
              <Link href="/explore" className="btn">
                Full Marketplace →
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden border border-[var(--ink)] bg-[var(--soft)] aspect-[4/3]">
            <img
              src="/images/HERO.jpg"
              alt="MG-Events featured venue"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="wrap">
          <FilterBar mode="hero" />
        </div>
      </section>

      {/* Core Direct-Booking Principles */}
      <div className="wrap">
        <div className="prin">
          <div>
            <b>0%</b>
            <span>
              Commission or markup. You pay the owner and no one else.
            </span>
          </div>
          <div>
            <b>100%</b>
            <span>
              Of listings are visited and verified before they go live.
            </span>
          </div>
          <div>
            <b>Live</b>
            <span>
              Calendars update the moment an owner confirms a date.
            </span>
          </div>
        </div>
      </div>

      {/* Available Venues with Live Budget & Category Filtering */}
      <section id="venues" className="mkt-section">
        <div className="wrap">
          <div className="head">
            <div>
              <h2>Available venues</h2>
              <span className="label block mt-2">
                Showing {filteredVenues.length} of {venues.length} verified
                rooms under {formatCurrency(maxBudget)}
              </span>
            </div>
            <div className="tabs" id="tabs" role="tablist">
              {CATEGORY_TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={category === t.value}
                  data-f={t.value}
                  className={`tab ${category === t.value ? "on" : ""}`}
                  onClick={() => dispatch(setCategory(t.value))}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rows" id="rows">
            {filteredVenues.length > 0 ? (
              filteredVenues.map((venue, idx) => (
                <ListingCard
                  key={venue.id}
                  listing={venue}
                  displayIndex={idx}
                  variant="row"
                  onQuickBook={(item) => setQuickBookListing(item)}
                />
              ))
            ) : (
              <div className="empty flex flex-wrap items-center justify-between gap-4">
                <span>
                  Nothing at this budget ({formatCurrency(maxBudget)}) yet. Try
                  raising it a little.
                </span>
                <button
                  type="button"
                  onClick={() => dispatch(setMaxBudget(12000))}
                  className="btn"
                >
                  Show All Budgets ($12,000)
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="mkt-section">
        <div className="wrap">
          <div className="head">
            <h2>How it works</h2>
          </div>
          <div className="steps">
            <div className="step">
              <em>01</em>
              <h3>Set your budget</h3>
              <p>
                Choose the event, date and spend. You only see what fits.
              </p>
            </div>
            <div className="step">
              <em>02</em>
              <h3>Compare for real</h3>
              <p>
                Verified photos, honest prices and open dates, all in one place.
              </p>
            </div>
            <div className="step">
              <em>03</em>
              <h3>Book the owner</h3>
              <p>
                Send a request straight to the owner and agree terms directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vendors */}
      <section id="vendors" className="mkt-section">
        <div className="wrap">
          <div className="head">
            <h2>Vendors</h2>
            <span className="label">Caterers · Photo · Florals · Sound</span>
          </div>
          <div className="rows">
            {vendors.map((vendor) => (
              <ListingCard
                key={vendor.id}
                listing={vendor}
                variant="vrow"
                onQuickBook={(item) => setQuickBookListing(item)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Quote */}
      <div className="wrap">
        <div className="quote">
          <p>
            “We saved thousands because there was no agent in between. The owner
            replied the same day.”
          </p>
          <span className="label">
            Claire &amp; Daniel · Wedding at Linden Estate
          </span>
        </div>
      </div>

      {/* For Owners CTA */}
      <section id="owners" className="mkt-section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta">
            <h2>Own a venue? Keep every booking.</h2>
            <div>
              <p>
                List for free, manage your own calendar and talk to customers
                directly.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => openCreateListing("venue")}
                  className="btn btn-filled"
                >
                  + List your venue
                </button>
                <Link className="btn" href="/dashboard/owner">
                  Owner Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Slide-Over Direct Booking Drawer */}
      <QuickBookModal
        listing={quickBookListing}
        onClose={() => setQuickBookListing(null)}
      />
    </main>
  );
}
