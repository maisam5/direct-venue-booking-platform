"use client";

import React from "react";
import useCountries, { Country } from "@/custom-hooks/useCountries";
import { MapPin } from "lucide-react";

interface CountrySelectProps {
  value: Country | null;
  onChange: (value: Country | null) => void;
}

export default function CountrySelect({
  value,
  onChange,
}: CountrySelectProps) {
  const { getAll, getByValue } = useCountries();
  const countries = getAll();

  return (
    <div className="w-full space-y-2 text-left">
      <label className="block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
        City / Neighborhood District
      </label>
      <div className="relative">
        <MapPin
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
        />
        <select
          aria-label="Select location"
          value={value?.value || ""}
          onChange={(e) => {
            const selected = getByValue(e.target.value);
            onChange(selected ?? null);
          }}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--ink)] cursor-pointer"
        >
          <option value="">Anywhere · Select a city or neighborhood...</option>
          {countries.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label} ({item.region})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
