"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

interface CounterProps {
  title: string;
  subtitle: string;
  value: number;
  step?: number;
  min?: number;
  onChange: (value: number) => void;
}

export default function Counter({
  title,
  subtitle,
  value,
  step = 1,
  min = 1,
  onChange,
}: CounterProps) {
  const onAdd = () => {
    onChange(value + step);
  };

  const onReduce = () => {
    if (value <= min) return;
    onChange(Math.max(min, value - step));
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-[var(--line)] last:border-b-0 w-full">
      <div className="flex flex-col text-left pr-4">
        <div className="font-medium text-base text-[var(--ink)]">{title}</div>
        <div className="font-normal text-xs text-[var(--muted)]">
          {subtitle}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onReduce}
          disabled={value <= min}
          aria-label={`Decrease ${title}`}
          className="w-9 h-9 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink)] hover:border-[var(--ink)] transition cursor-pointer disabled:opacity-40"
        >
          <Minus size={15} />
        </button>
        <input
          type="number"
          min={min}
          value={value}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            if (!Number.isNaN(parsed) && parsed >= min) {
              onChange(parsed);
            }
          }}
          aria-label={title}
          className="w-16 text-center font-semibold text-base text-[var(--ink)] bg-transparent border border-[var(--line)] rounded-md py-1 outline-none"
        />
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Increase ${title}`}
          className="w-9 h-9 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink)] hover:border-[var(--ink)] transition cursor-pointer"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
