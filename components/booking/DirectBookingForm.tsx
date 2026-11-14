"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Listing, EventCategory } from "@/types";
import {
  bookingSchema,
  BookingFormValues,
} from "@/lib/validations/bookingSchema";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectPackageTier,
  setDraftEventCategory,
  setDraftEventDate,
  setDraftGuestCount,
  toggleAddOn,
} from "@/store/slices/bookingDraftSlice";
import { createDirectBooking } from "@/actions/booking.actions";
import { formatCurrency } from "@/lib/format";
import { PriceBreakdownCard } from "./PriceBreakdownCard";
import { useClerkAuthFlow } from "@/hooks/useClerkAuthFlow";
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

  const activePackage =
    listing.packages.find((p) => p.id === draft.selectedPackageId) ??
    listing.packages[0];

  const clerkName = user?.fullName || user?.firstName || "";
  const clerkEmail = user?.primaryEmailAddress?.emailAddress || "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    values: {
      listingId: listing.id,
      packageId: activePackage?.id ?? "",
      eventCategory: draft.eventCategory,
      eventDate: draft.eventDate,
      guestCount: Math.min(draft.guestCount, listing.maxGuests),
      plannerName: clerkName,
      plannerEmail: clerkEmail,
      plannerPhone: user?.primaryPhoneNumber?.phoneNumber || "",
      selectedAddOnIds: draft.selectedAddOnIds,
      notes: "",
    },
  });

  const onSubmit = async (values: BookingFormValues) => {
    setServerError(null);

    if (!isSignedIn) {
      setServerError("Please sign in with Google before sending a booking request.");
      return;
    }

    const response = await createDirectBooking({
      ...values,
      calculatedTotal: draft.calculatedTotal,
    });

    if (!response.success || !response.booking) {
      setServerError(
        response.error || "This date was just reserved or blocked by the owner"
      );
      return;
    }

    // Invalidate real-time availability, bookings, and listings queries in TanStack Query
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["availability", listing.id],
      }),
      queryClient.invalidateQueries({ queryKey: ["bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["listings"] }),
    ]);

    setSubmittedCode(
      response.booking.bookingCode || response.booking.id
    );
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
          Your date ({draft.eventDate}) is now locked on the PostgreSQL live
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
      onSubmit={handleSubmit(onSubmit)}
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
                onClick={() => {
                  dispatch(selectPackageTier(pkg.id));
                  setValue("packageId", pkg.id);
                }}
                className={`w-full text-left p-3.5 border transition-colors ${
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
            value={draft.eventCategory}
            onChange={(e) => {
              const val = e.target.value as Exclude<EventCategory, "all">;
              dispatch(setDraftEventCategory(val));
              setValue("eventCategory", val);
            }}
          >
            {listing.categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[var(--bg)]">
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="bk-date">
            Date
          </label>
          <input
            id="bk-date"
            type="date"
            className="w-full mt-1 bg-transparent text-sm outline-none"
            value={draft.eventDate}
            onChange={(e) => {
              dispatch(setDraftEventDate(e.target.value));
              setValue("eventDate", e.target.value);
            }}
          />
          {errors.eventDate && (
            <span className="text-[11px] text-red-600 block mt-1">
              {errors.eventDate.message}
            </span>
          )}
        </div>

        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="bk-guests">
            Guests (Max {listing.maxGuests})
          </label>
          <input
            id="bk-guests"
            type="number"
            min={10}
            max={listing.maxGuests}
            className="w-full mt-1 bg-transparent text-sm outline-none"
            value={draft.guestCount}
            onChange={(e) => {
              const count = Math.max(
                10,
                Math.min(listing.maxGuests, Number(e.target.value) || 10)
              );
              dispatch(setDraftGuestCount(count));
              setValue("guestCount", count);
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
              {...register("plannerName")}
              className="w-full mt-1 bg-transparent text-sm outline-none"
            />
            {errors.plannerName && (
              <span className="text-[11px] text-red-600 block mt-1">
                {errors.plannerName.message}
              </span>
            )}
          </div>
          <div className="border border-[var(--line)] p-3">
            <label className="label block" htmlFor="plannerPhone">
              Phone Number *
            </label>
            <input
              id="plannerPhone"
              type="tel"
              placeholder="+1 (555) 234-5678"
              {...register("plannerPhone")}
              className="w-full mt-1 bg-transparent text-sm outline-none"
            />
            {errors.plannerPhone && (
              <span className="text-[11px] text-red-600 block mt-1">
                {errors.plannerPhone.message}
              </span>
            )}
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
            {...register("plannerEmail")}
            className="w-full mt-1 bg-transparent text-sm outline-none"
          />
          {errors.plannerEmail && (
            <span className="text-[11px] text-red-600 block mt-1">
              {errors.plannerEmail.message}
            </span>
          )}
        </div>

        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="notes">
            Note to {listing.ownerName} (Run of show, load-in, dietary)
          </label>
          <textarea
            id="notes"
            rows={2}
            placeholder="Share arrival time, catering plans, or questions for the owner..."
            {...register("notes")}
            className="w-full mt-1 bg-transparent text-sm outline-none resize-none"
          />
        </div>
      </div>

      {/* Price Breakdown explicitly showing $0 Broker Fee */}
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
                Sign in required to book
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Log in with Google to lock your date on the live calendar and
                message {listing.ownerName} directly.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={authPending !== null}
            onClick={() =>
              startGoogleAuth(
                "PLANNER",
                typeof window !== "undefined" ? window.location.pathname : `/listings/${listing.slug}`
              )
            }
            className="btn btn-filled w-full !py-3 text-sm"
          >
            {authPending === "PLANNER"
              ? "Redirecting to Google..."
              : `Continue with Google to Book ${listing.name}`}
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
