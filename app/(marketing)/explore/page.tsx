"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  resetFilters,
  setCategory,
  setKindFilter,
  setSearchQuery,
} from "@/store/slices/filterSlice";
import { EventCategory, Listing } from "@/types";
import { useMarketplaceListings } from "@/hooks/queries";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { QuickBookModal } from "@/components/booking/QuickBookModal";
import { formatCurrency } from "@/lib/format";

export default function ExploreMarketplacePage() {
  const dispatch = useAppDispatch();
  const {
    category,
    maxBudget,
    selectedDate,
    searchQuery,
    kindFilter,
  } = useAppSelector((state) => state.filters);

  const { data: rawFiltered = [] } = useMarketplaceListings({
    category,
    maxBudget,
    kindFilter,
    selectedDate,
    searchQuery,
  });

  const [viewLayout, setViewLayout] = useState<"grid" | "rows" | "map">("grid");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "capacity">(
    "price_asc"
  );
  const [quickBookListing, setQuickBookListing] = useState<Listing | null>(
    null
  );

  const filtered = [...rawFiltered].sort((a, b) => {
    if (sortBy === "price_asc") return a.basePrice - b.basePrice;
    if (sortBy === "price_desc") return b.basePrice - a.basePrice;
    return b.maxGuests - a.maxGuests;
  });

  return (
    <main className="pt-12">
      <div className="wrap">
        <span className="label">Direct Marketplace · Zero Broker Markup</span>
        <div className="head mt-3">
          <h1 className="text-[clamp(44px,6vw,84px)] leading-[0.95]">
            Explore verified rooms &amp; <i>makers.</i>
          </h1>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setViewLayout("grid")}
              className={`btn !py-2 !px-3.5 ${
                viewLayout === "grid" ? "btn-filled" : ""
              }`}
            >
              Photo Grid
            </button>
            <button
              type="button"
              onClick={() => setViewLayout("rows")}
              className={`btn !py-2 !px-3.5 ${
                viewLayout === "rows" ? "btn-filled" : ""
              }`}
            >
              Ledger Rows
            </button>
            <button
              type="button"
              onClick={() => setViewLayout("map")}
              className={`btn !py-2 !px-3.5 ${
                viewLayout === "map" ? "btn-filled" : ""
              }`}
            >
              Neighborhood Map
            </button>
          </div>
        </div>

        {/* Live Budget & Availability Search Bar */}
        <FilterBar mode="explore" />

        {/* Secondary Filter Bar: Kind + Text Search + Category Tabs + Sort */}
        <div className="py-5 border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-4">
          <div className="tabs">
            {(["all", "venue", "vendor"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => dispatch(setKindFilter(k))}
                className={`tab ${kindFilter === k ? "on" : ""}`}
              >
                {k === "all"
                  ? "All Listings"
                  : k === "venue"
                  ? "Venues Only"
                  : "Vendors Only"}
              </button>
            ))}

            <span className="text-[var(--line)]">|</span>

            {(
              ["all", "Wedding", "Birthday", "Corporate"] as EventCategory[]
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => dispatch(setCategory(cat))}
                className={`tab ${category === cat ? "on" : ""}`}
              >
                {cat === "all" ? "Any Event" : cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search neighborhood or name..."
              className="border border-[var(--line)] bg-transparent px-3 py-1.5 text-sm outline-none min-w-[200px]"
            />

            <select
              aria-label="Sort listings"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "price_asc" | "price_desc" | "capacity"
                )
              }
              className="border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-sm outline-none"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="capacity">Largest Guest Capacity</option>
            </select>

            <button
              type="button"
              onClick={() => dispatch(resetFilters())}
              className="text-xs underline text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              Reset ({formatCurrency(maxBudget)})
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="py-4 flex items-center justify-between text-xs text-[var(--muted)]">
          <span>
            Showing {filtered.length} verified{" "}
            {filtered.length === 1 ? "listing" : "listings"} under{" "}
            {formatCurrency(maxBudget)}
            {selectedDate ? ` · Open on ${selectedDate}` : ""}
          </span>
          <span>100% Direct-to-Owner Pricing · 0% Broker Commission</span>
        </div>

        {/* Results Container */}
        {filtered.length === 0 ? (
          <div className="rows">
            <div className="empty flex flex-wrap items-center justify-between gap-4">
              <span>
                Nothing at this budget yet. Try raising it or resetting filters.
              </span>
              <button
                type="button"
                onClick={() => dispatch(resetFilters())}
                className="btn"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : viewLayout === "rows" ? (
          <div className="rows">
            {filtered.map((item, index) => (
              <ListingCard
                key={item.id}
                listing={item}
                displayIndex={index}
                variant="row"
                onQuickBook={(l) => setQuickBookListing(l)}
              />
            ))}
          </div>
        ) : viewLayout === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filtered.map((item, index) => (
              <ListingCard
                key={item.id}
                listing={item}
                displayIndex={index}
                variant="card"
                onQuickBook={(l) => setQuickBookListing(l)}
              />
            ))}
          </div>
        ) : (
          /* Interactive Neighborhood Architectural Map Split-View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            <div className="lg:col-span-7 border border-[var(--ink)] bg-[var(--soft)] p-6 relative min-h-[480px] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <span className="label">
                  District Atlas · Verified Coordinates
                </span>
                <span className="text-xs text-[var(--muted)]">
                  Click any price pin to book directly
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-auto py-8">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setQuickBookListing(item)}
                    className="border border-[var(--ink)] bg-[var(--bg)] p-4 text-left hover:bg-[var(--ink)] hover:text-[var(--bg)] transition-colors cursor-pointer group"
                  >
                    <span className="label block group-hover:!text-[var(--bg)] opacity-75">
                      {item.area}
                    </span>
                    <p className="serif text-2xl leading-tight mt-1">
                      {item.name}
                    </p>
                    <div className="mt-3 pt-2 border-t border-[var(--line)] flex items-baseline justify-between">
                      <span className="text-xs opacity-75">
                        {item.maxGuests} guests
                      </span>
                      <span className="serif text-xl">
                        {formatCurrency(item.basePrice)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-[var(--line)] pt-3 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>
                  Districts: Downtown · Waterfront · Riverside · Old Town ·
                  North Hills · Lakeside
                </span>
                <span>All properties visited in person</span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4 max-h-[540px] overflow-y-auto pr-1">
              {filtered.map((item, idx) => (
                <div
                  key={item.id}
                  className="border border-[var(--line)] bg-[var(--bg)] p-4 flex items-center justify-between gap-4 hover:bg-[var(--soft)]"
                >
                  <div className="flex items-center gap-3">
                    {item.coverImage && (
                      <img
                        src={item.coverImage}
                        alt={item.name}
                        className="h-14 w-20 object-cover border border-[var(--line)]"
                      />
                    )}
                    <div>
                      <span className="label">
                        0{idx + 1} · {item.area}
                      </span>
                      <h3 className="text-2xl leading-none mt-0.5">
                        <Link
                          href={`/listings/${item.slug}`}
                          className="no-underline hover:underline"
                        >
                          {item.name}
                        </Link>
                      </h3>
                      <span className="text-xs text-[var(--muted)]">
                        {item.availabilityLabel} · {item.priceUnitLabel}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuickBookListing(item)}
                    className="btn !py-2 !px-3 text-xs"
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <QuickBookModal
        listing={quickBookListing}
        onClose={() => setQuickBookListing(null)}
      />
    </main>
  );
}
