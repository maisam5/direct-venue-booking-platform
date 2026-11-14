"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setCategory,
  setGuestRange,
  setMaxBudget,
  setSelectedDate,
} from "@/store/slices/filterSlice";
import { EventCategory } from "@/types";
import { BudgetSlider } from "./BudgetSlider";

interface FilterBarProps {
  mode?: "hero" | "explore";
  onSearchAction?: () => void;
}

export function FilterBar({ mode = "hero", onSearchAction }: FilterBarProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { category, maxBudget, guestRange, selectedDate } = useAppSelector(
    (state) => state.filters
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchAction) {
      onSearchAction();
      return;
    }
    if (mode === "hero") {
      const target = document.getElementById("venues");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push("/explore");
      }
    }
  };

  return (
    <form className="search" onSubmit={handleSubmit}>
      <div>
        <span className="label">Event</span>
        <select
          id="ev"
          aria-label="Event category"
          value={category}
          onChange={(e) =>
            dispatch(setCategory(e.target.value as EventCategory))
          }
        >
          <option value="all">Any event</option>
          <option value="Wedding">Wedding</option>
          <option value="Birthday">Birthday</option>
          <option value="Corporate">Corporate</option>
        </select>
      </div>

      <div>
        <span className="label">Date</span>
        <input
          type="date"
          aria-label="Event date"
          value={selectedDate}
          onChange={(e) => dispatch(setSelectedDate(e.target.value))}
        />
      </div>

      <div>
        <span className="label">Guests</span>
        <select
          aria-label="Guest count range"
          value={guestRange}
          onChange={(e) => dispatch(setGuestRange(e.target.value))}
        >
          <option value="Up to 50">Up to 50</option>
          <option value="50–150">50–150</option>
          <option value="150–300">150–300</option>
          <option value="300+">300+</option>
        </select>
      </div>

      <BudgetSlider
        value={maxBudget}
        min={1000}
        max={12000}
        step={500}
        onChange={(val) => dispatch(setMaxBudget(val))}
      />

      <div>
        {mode === "hero" ? (
          <a
            className="btn"
            href="#venues"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            Search
          </a>
        ) : (
          <button type="submit" className="btn">
            Apply Filters
          </button>
        )}
      </div>
    </form>
  );
}
