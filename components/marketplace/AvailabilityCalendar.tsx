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
            <span className="h-2 w-2 rounded-full bg-[var(--ink)]" />
            <span>Open</span>
          </span>
          <span className="inline-flex items-center gap-2 text-[var(--muted)]">
            <span className="h-2 w-2 border border-[var(--muted)]" />
            <span>Booked / Held</span>
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
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelectDate(dateStr)}
              title={
                slot.note
                  ? `${dateStr}: ${slot.note}`
                  : `${dateStr} (${slot.status})`
              }
              className={`h-12 flex flex-col items-center justify-center border text-xs transition-colors ${
                isSelected
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] font-medium"
                  : isAvailable
                  ? "border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--soft)] cursor-pointer"
                  : "border-[var(--line)] bg-[var(--soft)] text-[var(--muted)] line-through opacity-55 cursor-not-allowed"
              }`}
            >
              <span>{day}</span>
              <span
                className={`text-[9px] uppercase tracking-wider ${
                  isSelected
                    ? "text-[var(--bg)]"
                    : isAvailable
                    ? "text-[var(--muted)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {isSelected ? "Chosen" : isAvailable ? "Open" : "Taken"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
