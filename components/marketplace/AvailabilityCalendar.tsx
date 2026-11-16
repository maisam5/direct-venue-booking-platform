"use client";

import React from "react";
import { AvailabilitySlot } from "@/types";

interface AvailabilityCalendarProps {
  slots: AvailabilitySlot[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  monthLabel?: string;
}

const DECEMBER_2026_DAYS = Array.from({ length: 31 }, (_, idx) => {
  const day = idx + 1;
  const dateStr = `2026-12-${String(day).padStart(2, "0")}`;
  return { day, dateStr };
});

export function AvailabilityCalendar({
  slots,
  selectedDate,
  onSelectDate,
  monthLabel = "December 2026 · Live Owner Calendar",
}: AvailabilityCalendarProps) {
  const getSlotStatus = (dateStr: string) => {
    const match = slots.find((s) => s.date === dateStr);
    if (match) return match;
    // Default weekday/weekend pattern so calendar feels complete
    const dayNum = Number(dateStr.split("-")[2]);
    if (dayNum % 7 === 0 || dayNum % 5 === 0) {
      return { date: dateStr, status: "available" as const };
    }
    return { date: dateStr, status: "available" as const };
  };

  return (
    <div className="border border-[var(--ink)] bg-[var(--bg)] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-[var(--line)]">
        <div>
          <span className="label block">Real-Time Sync</span>
          <h3 className="text-[28px] leading-tight mt-1">{monthLabel}</h3>
        </div>
        <div className="flex items-center gap-5 text-xs">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <span>Open</span>
          </span>
          <span className="inline-flex items-center gap-2 text-red-600 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
            <span>Booked</span>
          </span>
        </div>
      </div>

      {/* Days of week header (Dec 1, 2026 is a Tuesday; 1 offset cell) */}
      <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span key={d} className="label !text-[10px] py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {/* Empty cell for Monday Nov 30 */}
        <div className="h-12 border border-transparent" aria-hidden="true" />

        {DECEMBER_2026_DAYS.map(({ day, dateStr }) => {
          const slot = getSlotStatus(dateStr);
          const isAvailable = slot.status === "available";
          const isBooked = slot.status === "booked";
          const isSelected = selectedDate === dateStr && isAvailable;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectDate(dateStr)}
              title={
                !isAvailable
                  ? `${dateStr}: Already ${isBooked ? "Booked" : "Blocked"}`
                  : `${dateStr} (Available)`
              }
              className={`h-12 flex flex-col items-center justify-center border text-xs transition-colors ${
                isSelected
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] font-medium"
                  : isAvailable
                  ? "border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--soft)] cursor-pointer"
                  : "border-red-300 bg-red-500/10 text-red-600 cursor-not-allowed"
              }`}
            >
              <span className={!isAvailable ? "line-through font-medium" : ""}>
                {day}
              </span>
              <span
                className={`text-[9px] uppercase tracking-wider font-semibold ${
                  isSelected
                    ? "text-[var(--bg)]"
                    : isAvailable
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {isSelected
                  ? "Chosen"
                  : isAvailable
                  ? "Open"
                  : isBooked
                  ? "Booked"
                  : "Blocked"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
