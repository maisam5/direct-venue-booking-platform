"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  label: string;
  icon: LucideIcon;
  selected?: boolean;
  description?: string;
  onClick: () => void;
}

export default function CategoryCard({
  label,
  icon: Icon,
  selected,
  description,
  onClick,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 p-4 flex flex-col items-start gap-2.5 text-left transition cursor-pointer w-full ${
        selected
          ? "border-[var(--ink)] bg-[var(--soft)] text-[var(--ink)] shadow-sm"
          : "border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
      }`}
    >
      <Icon
        size={24}
        className={selected ? "text-[var(--ink)]" : "text-[var(--muted)]"}
      />
      <div>
        <div className="font-semibold text-sm text-[var(--ink)]">{label}</div>
        {description && (
          <div className="text-[11px] text-[var(--muted)] mt-0.5 line-clamp-1">
            {description}
          </div>
        )}
      </div>
    </button>
  );
}
