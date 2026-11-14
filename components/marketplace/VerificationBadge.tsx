import React from "react";

interface VerificationBadgeProps {
  verifiedDate?: string;
  compact?: boolean;
}

export function VerificationBadge({
  verifiedDate = "Visited & Verified",
  compact = false,
}: VerificationBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-2 border border-[var(--line)] bg-[var(--soft)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--ink)]"
      title={`100% On-Site Verified · ${verifiedDate}`}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--ink)]"
        aria-hidden="true"
      />
      <span>{compact ? "Verified" : `Verified · ${verifiedDate}`}</span>
    </span>
  );
}
