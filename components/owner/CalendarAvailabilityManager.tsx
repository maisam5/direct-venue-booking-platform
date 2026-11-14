"use client";

import React, { useState } from "react";
import {
  useMarketplaceListings,
  useListingAvailability,
  useToggleDateMutation,
} from "@/hooks/queries";

const DEC_DAYS = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  return {
    day,
    date: `2026-12-${String(day).padStart(2, "0")}`,
  };
});

export function CalendarAvailabilityManager() {
  const { data: listings = [] } = useMarketplaceListings();
  const [selectedSlug, setSelectedSlug] = useState("harbor-hall");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const activeListing =
    listings.find((l) => l.slug === selectedSlug) ?? listings[0];

  const { data: liveSlots } = useListingAvailability(
    activeListing?.id ?? "",
    "2026-12",
    activeListing?.availability
  );

  const toggleMutation = useToggleDateMutation(
    activeListing?.id ?? "",
    "2026-12"
  );

  if (!activeListing) {
    return null;
  }

  const slots = liveSlots ?? activeListing.availability;

  const getStatusForDate = (date: string) => {
    const slot = slots.find((s) => s.date === date);
    return slot?.status ?? "available";
  };

  const handleToggleDate = (date: string) => {
    setFeedbackError(null);
    const currentStatus = getStatusForDate(date);
    if (currentStatus === "booked") {
      setFeedbackError(
        `Date ${date} has an active BOOKED reservation. Decline or cancel the booking request above before releasing this date.`
      );
      return;
    }

    toggleMutation.mutate(
      {
        listingId: activeListing.id,
        date,
        note: "Owner Hold",
      },
      {
        onSuccess: (res) => {
          if (!res.success && res.error) {
            setFeedbackError(res.error);
          }
        },
      }
    );
  };

  return (
    <div className="border border-[var(--ink)] bg-[var(--bg)] p-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <span className="label block">
            Live PostgreSQL Calendar Control (Optimistic Sync)
          </span>
          <h3 className="text-[32px] leading-none mt-1">
            Block or open dates instantly
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1">
            Click any December 2026 date to toggle between Open and Hold
            instantly. Active BOOKED dates are protected.
          </p>
        </div>

        <div className="min-w-[220px]">
          <label className="label block" htmlFor="owner-cal-select">
            Active Property
          </label>
          <select
            id="owner-cal-select"
            value={activeListing.slug}
            onChange={(e) => {
              setSelectedSlug(e.target.value);
              setFeedbackError(null);
            }}
            className="w-full mt-1 border border-[var(--ink)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
          >
            {listings.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name} ({item.area})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedbackError && (
        <div
          role="alert"
          className="border border-red-600 bg-[var(--soft)] p-3 text-xs text-red-600"
        >
          {feedbackError}
        </div>
      )}

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) => (
          <span key={dayName} className="label !text-[10px] py-1">
            {dayName}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        <div className="h-14" aria-hidden="true" />
        {DEC_DAYS.map(({ day, date }) => {
          const status = getStatusForDate(date);
          return (
            <button
              key={date}
              type="button"
              onClick={() => handleToggleDate(date)}
              className={`h-14 border p-1.5 flex flex-col items-center justify-between text-xs transition-colors cursor-pointer ${
                status === "available"
                  ? "border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--soft)]"
                  : status === "blocked"
                  ? "border-[var(--ink)] bg-[var(--soft)] text-[var(--muted)]"
                  : "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
              }`}
            >
              <span className="font-medium">{day}</span>
              <span className="text-[9px] uppercase tracking-wider">
                {status === "available"
                  ? "Open"
                  : status === "blocked"
                  ? "Hold"
                  : "Booked"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
