"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Listing, EventCategory } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectPackageTier,
  setDraftEventCategory,
  setDraftEventDate,
  setDraftGuestCount,
  toggleAddOn,
} from "@/store/slices/bookingDraftSlice";
import { createDirectBooking } from "@/actions/booking.actions";
import { useListingAvailability } from "@/hooks/queries";
import { formatCurrency } from "@/lib/format";
import { PriceBreakdownCard } from "./PriceBreakdownCard";
import { useClerkAuthFlow } from "@/hooks/useClerkAuthFlow";
import {
  executePendingBookingOnce,
  peekPendingBooking,
  savePendingBooking,
} from "@/lib/pending-booking";
import { toast } from "@/lib/toast";
import { Lock } from "lucide-react";

interface DirectBookingFormProps {
  listing: Listing;
}

export function DirectBookingForm({ listing }: DirectBookingFormProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useAppSelector((state) => state.bookingDraft);
  const { user, isSignedIn, isLoaded, startGoogleAuth, authPending } =
    useClerkAuthFlow();

  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [plannerName, setPlannerName] = useState("");
  const [plannerPhone, setPlannerPhone] = useState("");
  const [plannerEmail, setPlannerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const { data: liveSlots } = useListingAvailability(
    listing.id,
    "2026-12",
    listing.availability
  );
  const effectiveSlots = liveSlots ?? listing.availability;

  const unavailableDateMap = React.useMemo(() => {
    const map = new Map<string, "booked" | "blocked">();
    for (const s of effectiveSlots) {
      if (s.status === "booked" || s.status === "blocked") {
        map.set(s.date, s.status);
      }
    }
    return map;
  }, [effectiveSlots]);

  const firstOpenDate = React.useMemo(() => {
    for (let day = 14; day <= 31; day++) {
      const candidate = `2026-12-${String(day).padStart(2, "0")}`;
      if (!unavailableDateMap.has(candidate)) {
        return candidate;
      }
    }
    for (let day = 1; day <= 13; day++) {
      const candidate = `2026-12-${String(day).padStart(2, "0")}`;
      if (!unavailableDateMap.has(candidate)) {
        return candidate;
      }
    }
    return "2026-12-28";
  }, [unavailableDateMap]);

  // If the initial default date in Redux is already booked/blocked when slots load, auto-switch to firstOpenDate
  const autoSwitchedListingRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (autoSwitchedListingRef.current === listing.id) return;
    if (draft.eventDate && unavailableDateMap.has(draft.eventDate)) {
      autoSwitchedListingRef.current = listing.id;
      dispatch(setDraftEventDate(firstOpenDate));
    }
  }, [listing.id, draft.eventDate, unavailableDateMap, firstOpenDate, dispatch]);

  const activePackage =
    listing.packages.find((p) => p.id === draft.selectedPackageId) ??
    listing.packages[0];

  const clerkName = user?.fullName || user?.firstName || "";
  const clerkEmail = user?.primaryEmailAddress?.emailAddress || "";
  const clerkPhone = user?.primaryPhoneNumber?.phoneNumber || "";

  // Pre-fill contact details from Clerk user when available
  useEffect(() => {
    if (clerkName) {
      setPlannerName((prev) => prev || clerkName);
    }
    if (clerkEmail) {
      setPlannerEmail((prev) => prev || clerkEmail);
    }
    if (clerkPhone) {
      setPlannerPhone((prev) => prev || clerkPhone);
    }
  }, [clerkName, clerkEmail, clerkPhone]);

  // Check if redirected back with ?booked=CODE
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const bookedParam = params.get("booked");
    if (bookedParam) {
      setSubmittedCode(bookedParam);
    }
  }, []);

  // If user just signed in and landed back on this form with a pending booking
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!peekPendingBooking()) return;

    async function completeSavedBooking() {
      setIsSubmitting(true);
      setServerError(null);
      try {
        const res = await executePendingBookingOnce({
          fullName: user?.fullName,
          firstName: user?.firstName,
          email: user?.primaryEmailAddress?.emailAddress,
          phone: user?.primaryPhoneNumber?.phoneNumber,
        });

        if (!res.executed) return;

        if (!res.success || !res.booking) {
          const msg =
            res.error || "Could not complete booking for the selected date.";
          setServerError(msg);
          toast(msg);
          return;
        }

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["availability", listing.id],
          }),
          queryClient.invalidateQueries({ queryKey: ["bookings"] }),
          queryClient.invalidateQueries({ queryKey: ["listings"] }),
        ]);

        const code = res.booking.bookingCode || res.booking.id;
        toast(`Booking confirmed! Ref #${code}`);
        setSubmittedCode(code);
      } finally {
        setIsSubmitting(false);
      }
    }

    completeSavedBooking();
  }, [isLoaded, isSignedIn, user, listing.id, queryClient]);

  const resolvedCategory: Exclude<EventCategory, "all"> =
    draft.eventCategory || listing.categories[0] || "Wedding";
  const resolvedDate = draft.eventDate || firstOpenDate;
  const selectedDateConflict = unavailableDateMap.get(resolvedDate);
  const resolvedGuestCount = Math.max(
    1,
    Math.min(draft.guestCount || 50, listing.maxGuests || 500)
  );

  const handleSignInAndBook = async () => {
    setServerError(null);
    if (!resolvedDate) {
      const msg = "Please choose an event date before booking.";
      setServerError(msg);
      toast(msg);
      return;
    }

    if (selectedDateConflict) {
      const msg = `Date ${resolvedDate} is already ${selectedDateConflict}. Please select an available date.`;
      setServerError(msg);
      toast(msg);
      return;
    }

    savePendingBooking({
      listingId: listing.id,
      listingSlug: listing.slug,
      listingName: listing.name,
      ownerName: listing.ownerName,
      packageId: activePackage?.id || "",
      eventCategory: resolvedCategory,
      eventDate: resolvedDate,
      guestCount: resolvedGuestCount,
      plannerName: plannerName.trim(),
      plannerEmail: plannerEmail.trim(),
      plannerPhone: plannerPhone.trim(),
      selectedAddOnIds: draft.selectedAddOnIds,
      notes: notes.trim(),
      calculatedTotal: draft.calculatedTotal,
      createdAt: Date.now(),
    });

    await startGoogleAuth("PLANNER", `/listings/${listing.slug}`);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!isSignedIn) {
      await handleSignInAndBook();
      return;
    }

    const finalName = (plannerName.trim() || clerkName || "Verified Planner").trim();
    const finalEmail = (plannerEmail.trim() || clerkEmail).trim();
    const finalPhone = (
      plannerPhone.trim() ||
      clerkPhone ||
      "+92 300 0000000"
    ).trim();

    if (!resolvedDate) {
      const msg = "Please select an event date.";
      setServerError(msg);
      toast(msg);
      return;
    }

    if (selectedDateConflict) {
      const msg = `Date ${resolvedDate} is already ${selectedDateConflict}. Please choose an open date.`;
      setServerError(msg);
      toast(msg);
      return;
    }

    if (!finalEmail || !/^\S+@\S+\.\S+$/.test(finalEmail)) {
      const msg = "Please enter a valid email address.";
      setServerError(msg);
      toast(msg);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createDirectBooking({
        listingId: listing.id,
        packageId: activePackage?.id || "",
        eventCategory: resolvedCategory,
        eventDate: resolvedDate,
        guestCount: resolvedGuestCount,
        plannerName: finalName,
        plannerEmail: finalEmail,
        plannerPhone: finalPhone,
        selectedAddOnIds: draft.selectedAddOnIds,
        notes: notes.trim(),
        calculatedTotal: draft.calculatedTotal,
      });

      if (!response.success || !response.booking) {
        const msg =
          response.error ||
          "Unable to complete booking. Please try another date.";
        setServerError(msg);
        toast(msg);
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["availability", listing.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["bookings"] }),
        queryClient.invalidateQueries({ queryKey: ["listings"] }),
      ]);

      const code = response.booking.bookingCode || response.booking.id;
      toast(`Booking confirmed! Ref #${code}`);
      setSubmittedCode(code);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit booking.";
      setServerError(msg);
      toast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedCode) {
    return (
      <div className="border border-[var(--ink)] bg-[var(--bg)] p-7 space-y-5">
        <span className="label">
          Request Dispatched · Ref #{submittedCode}
        </span>
        <h3 className="text-[36px] leading-none">
          Sent straight to {listing.ownerName}.
        </h3>
        <p className="text-sm text-[var(--muted)]">
          Your date ({resolvedDate}) is now locked on the PostgreSQL live
          calendar while {listing.ownerName} reviews your terms. Confirmation
          and lead alert emails have been dispatched via Resend.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/user")}
            className="btn btn-filled"
          >
            View in My Bookings
          </button>
          <button
            type="button"
            onClick={() => setSubmittedCode(null)}
            className="btn"
          >
            Book Another Date
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      className="border border-[var(--ink)] bg-[var(--bg)] p-6 space-y-6"
      noValidate
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <span className="label block">Direct Owner Contract</span>
          <h3 className="text-[32px] leading-tight mt-1">
            Book {listing.ownerName}
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {listing.ownerRole} · {listing.ownerResponseTime}
          </p>
        </div>
        <div className="text-right">
          <span className="label block">From</span>
          <span className="serif text-[28px] leading-none">
            {listing.priceUnitLabel}
          </span>
        </div>
      </div>

      {serverError && (
        <div
          role="alert"
          className="border border-red-600 bg-[var(--soft)] p-3.5 text-xs text-red-600 font-medium"
        >
          {serverError}
        </div>
      )}

      {/* Package Tier Selection */}
      <div>
        <span className="label block mb-2">01 · Select Package Tier</span>
        <div className="space-y-2.5">
          {listing.packages.map((pkg) => {
            const isSelected = activePackage?.id === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => dispatch(selectPackageTier(pkg.id))}
                className={`w-full text-left p-3.5 border transition-colors cursor-pointer ${
                  isSelected
                    ? "border-[var(--ink)] bg-[var(--soft)]"
                    : "border-[var(--line)] bg-[var(--bg)] hover:bg-[var(--soft)]"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-sm">{pkg.name}</span>
                  <span className="serif text-xl">
                    {formatCurrency(pkg.price)}
                    {pkg.priceType === "per_guest" ? "/guest" : ""}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {pkg.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Type, Date & Guest Count */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="bk-category">
            Event
          </label>
          <select
            id="bk-category"
            className="w-full mt-1 bg-transparent text-sm outline-none"
            value={resolvedCategory}
            onChange={(e) => {
              const val = e.target.value as Exclude<EventCategory, "all">;
              dispatch(setDraftEventCategory(val));
            }}
          >
            {listing.categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[var(--bg)]">
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div
          className={`border p-3 ${
            selectedDateConflict
              ? "border-red-600 bg-red-500/10"
              : "border-[var(--line)]"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <label className="label block" htmlFor="bk-date">
              Date
            </label>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                selectedDateConflict ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {selectedDateConflict ? "Booked" : "Open"}
            </span>
          </div>
          <input
            id="bk-date"
            type="date"
            className="w-full mt-1 bg-transparent text-sm outline-none"
            value={resolvedDate}
            onChange={(e) => dispatch(setDraftEventDate(e.target.value))}
          />
          {selectedDateConflict && (
            <button
              type="button"
              onClick={() => dispatch(setDraftEventDate(firstOpenDate))}
              className="mt-1 text-[11px] text-red-600 underline text-left block cursor-pointer"
            >
              Already booked · Use {firstOpenDate}
            </button>
          )}
        </div>

        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="bk-guests">
            Guests (Max {listing.maxGuests})
          </label>
          <input
            id="bk-guests"
            type="number"
            min={1}
            max={listing.maxGuests}
            className="w-full mt-1 bg-transparent text-sm outline-none"
            value={resolvedGuestCount}
            onChange={(e) => {
              const count = Math.max(
                1,
                Math.min(listing.maxGuests || 500, Number(e.target.value) || 1)
              );
              dispatch(setDraftGuestCount(count));
            }}
          />
        </div>
      </div>

      {/* Optional Owner Add-ons */}
      {listing.addOns.length > 0 && (
        <div>
          <span className="label block mb-2">02 · Optional Owner Add-Ons</span>
          <div className="space-y-2">
            {listing.addOns.map((addon) => {
              const checked = draft.selectedAddOnIds.includes(addon.id);
              return (
                <label
                  key={addon.id}
                  className="flex items-start justify-between gap-3 border border-[var(--line)] p-3 cursor-pointer hover:bg-[var(--soft)]"
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => dispatch(toggleAddOn(addon.id))}
                      className="mt-1 accent-[var(--ink)]"
                    />
                    <div>
                      <span className="text-sm font-medium block">
                        {addon.name}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {addon.description}
                      </span>
                    </div>
                  </div>
                  <span className="serif text-lg whitespace-nowrap">
                    +{formatCurrency(addon.price)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Direct Contact Details */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="label block">03 · Your Direct Contact *</span>
          <span className="text-[11px] text-[var(--muted)]">
            Shared directly with {listing.ownerName}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border border-[var(--line)] p-3">
            <label className="label block" htmlFor="plannerName">
              Full Name *
            </label>
            <input
              id="plannerName"
              type="text"
              placeholder="Your full name"
              value={plannerName}
              onChange={(e) => setPlannerName(e.target.value)}
              className="w-full mt-1 bg-transparent text-sm outline-none"
            />
          </div>
          <div className="border border-[var(--line)] p-3">
            <label className="label block" htmlFor="plannerPhone">
              Phone Number *
            </label>
            <input
              id="plannerPhone"
              type="tel"
              placeholder="+92 300 1234567"
              value={plannerPhone}
              onChange={(e) => setPlannerPhone(e.target.value)}
              className="w-full mt-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="plannerEmail">
            Email Address *
          </label>
          <input
            id="plannerEmail"
            type="email"
            placeholder="you@example.com"
            value={plannerEmail}
            onChange={(e) => setPlannerEmail(e.target.value)}
            className="w-full mt-1 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="notes">
            Note to {listing.ownerName} (Run of show, load-in, dietary)
          </label>
          <textarea
            id="notes"
            rows={2}
            placeholder="Share arrival time, catering plans, or questions for the owner..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full mt-1 bg-transparent text-sm outline-none resize-none"
          />
        </div>
      </div>

      {/* Price Breakdown */}
      <PriceBreakdownCard
        packageLabel={activePackage?.name ?? "Base Rental"}
        venueSubtotal={draft.venueSubtotal}
        addOnsSubtotal={draft.addOnsSubtotal}
        totalAmount={draft.calculatedTotal}
        ownerName={listing.ownerName}
      />

      {isLoaded && !isSignedIn ? (
        <div className="border border-[var(--ink)] bg-[var(--soft)] p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <Lock size={16} className="mt-0.5 shrink-0 text-[var(--ink)]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
                Sign in &amp; instant booking
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Sign in with Google and your booking for {listing.name} will be
                confirmed automatically.
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={authPending !== null || isSubmitting}
            className="btn btn-filled w-full !py-3 text-sm"
          >
            {authPending === "PLANNER" || isSubmitting
              ? "Signing in & saving your booking..."
              : `Sign in with Google & Book ${listing.name}`}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting || !isLoaded}
          className="btn btn-filled w-full !py-3.5 text-sm"
        >
          {isSubmitting
            ? "Reserving Date Atomically..."
            : `Send Direct Request to ${listing.ownerName}`}
        </button>
      )}
    </form>
  );
}
