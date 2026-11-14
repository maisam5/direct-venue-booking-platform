import React from "react";
import { formatCurrency } from "@/lib/format";

interface PriceBreakdownCardProps {
  packageLabel: string;
  venueSubtotal: number;
  addOnsSubtotal: number;
  totalAmount: number;
  ownerName: string;
}

export function PriceBreakdownCard({
  packageLabel,
  venueSubtotal,
  addOnsSubtotal,
  totalAmount,
  ownerName,
}: PriceBreakdownCardProps) {
  const typicalBrokerFee = Math.round(totalAmount * 0.18);

  return (
    <div className="border border-[var(--ink)] bg-[var(--soft)] p-5">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--line)]">
        <span className="label">Direct Price Ledger</span>
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--ink)]">
          0% Commission
        </span>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[var(--muted)]">{packageLabel}</span>
          <span>{formatCurrency(venueSubtotal)}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[var(--muted)]">Selected Owner Add-ons</span>
          <span>{formatCurrency(addOnsSubtotal)}</span>
        </div>

        <div className="flex items-center justify-between gap-2 py-2 border-y border-[var(--line)] font-medium">
          <span>Broker / Middleman Fee (0%)</span>
          <span className="serif text-lg">$0</span>
        </div>
      </div>

      <div className="pt-3 mt-2 flex items-baseline justify-between">
        <div>
          <span className="label block">Total Paid to {ownerName}</span>
          <span className="text-xs text-[var(--muted)]">
            Saves ~{formatCurrency(typicalBrokerFee)} vs. 18% agency markup
          </span>
        </div>
        <span className="serif text-[36px] leading-none">
          {formatCurrency(totalAmount)}
        </span>
      </div>
    </div>
  );
}
