"use client";

import React from "react";
import { formatCurrency } from "@/lib/format";

interface BudgetSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (nextValue: number) => void;
  id?: string;
}

export function BudgetSlider({
  value,
  min = 1000,
  max = 12000,
  step = 500,
  onChange,
  id = "rg",
}: BudgetSliderProps) {
  return (
    <div>
      <span className="label">Budget</span>
      <div className="amt" id="amt">
        {formatCurrency(value)}
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label="Maximum venue budget"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
