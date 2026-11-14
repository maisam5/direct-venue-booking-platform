"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  listingSchema,
  ListingFormValues,
} from "@/lib/validations/listingSchema";
import { createOwnerListingAction } from "@/actions/listing.actions";
import { categories, getCategoryBySlug } from "@/constants/Categories";
import { MultiImageUploaderUI } from "./MultiImageUploaderUI";

export function ListingForm() {
  const queryClient = useQueryClient();
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("wedding-hall");
  const [selectedServiceOptions, setSelectedServiceOptions] = useState<string[]>([
    "Valet Parking",
    "Bridal / VIP Suite",
  ]);
  const [galleryImages, setGalleryImages] = useState<string[]>([
    "mgevents/venues/harbor-hall-hero",
    "mgevents/venues/harbor-hall-promenade",
    "mgevents/venues/solstice-courtyard",
  ]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      name: "",
      kind: "venue",
      area: "",
      address: "",
      maxGuests: 160,
      basePrice: 3200,
      categories: ["Wedding", "Corporate"],
      ownerName: "Clara Chen-strom",
      contactEmail: "",
      contactPhone: "",
      shortSummary: "",
      dimensions: "80 ft × 45 ft · 18 ft ceiling",
    },
  });

  const selectedCategories = watch("categories") ?? [];
  const selectedKind = watch("kind");
  const availableCategories = categories.filter((c) => c.kind === selectedKind);
  const activeCategoryObj =
    getCategoryBySlug(selectedCategorySlug) ?? availableCategories[0];

  const handleKindChange = (nextKind: "venue" | "vendor") => {
    setValue("kind", nextKind);
    const firstCat = categories.find((c) => c.kind === nextKind);
    if (firstCat) {
      setSelectedCategorySlug(firstCat.slug);
      setSelectedServiceOptions(firstCat.serviceOptions.slice(0, 3));
    }
    if (nextKind === "vendor") {
      setValue("dimensions", "Full-service vendor package");
    } else {
      setValue("dimensions", "80 ft × 45 ft · 18 ft ceiling");
    }
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategorySlug(slug);
    const catObj = getCategoryBySlug(slug);
    if (catObj) {
      setSelectedServiceOptions(catObj.serviceOptions.slice(0, 3));
    }
  };

  const toggleServiceOption = (option: string) => {
    setSelectedServiceOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const toggleCategory = (cat: "Wedding" | "Birthday" | "Corporate") => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    if (next.length > 0) {
      setValue("categories", next, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: ListingFormValues) => {
    setServerError(null);
    if (galleryImages.length < 3 || galleryImages.length > 5) {
      setServerError("Please include between 3 and 5 photos for your listing.");
      return;
    }

    const response = await createOwnerListingAction({
      ...values,
      coverImage: galleryImages[0],
      galleryImages,
      categorySlug: activeCategoryObj?.slug,
      serviceOptions: selectedServiceOptions,
    });

    if (!response.success || !response.listing) {
      setServerError(
        response.error || "Unable to publish listing to PostgreSQL."
      );
      return;
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["listings"] }),
      queryClient.invalidateQueries({ queryKey: ["my-listings"] }),
    ]);
    setCreatedSlug(response.listing.slug);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border border-[var(--ink)] bg-[var(--bg)] p-6 space-y-6"
      noValidate
    >
      <div className="border-b border-[var(--line)] pb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="label block">Zero-Commission Onboarding</span>
          <h3 className="text-[32px] leading-none mt-1">
            Publish a direct venue or service
          </h3>
        </div>
        <span className="text-xs text-[var(--muted)]">
          Keep 100% of every booking
        </span>
      </div>

      {serverError && (
        <div
          role="alert"
          className="border border-red-600 bg-[var(--soft)] p-3 text-xs text-red-600"
        >
          {serverError}
        </div>
      )}

      {createdSlug && (
        <div className="border border-[var(--ink)] bg-[var(--soft)] p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="label block">
              Saved to Supabase PostgreSQL
            </span>
            <p className="text-sm mt-0.5">
              Your listing is now live in the marketplace and available for
              direct bookings.
            </p>
          </div>
          <a href={`/listings/${createdSlug}`} className="btn">
            View Live Page
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-[var(--line)] p-3 sm:col-span-2">
          <label className="label block" htmlFor="lf-name">
            Venue or Studio Name
          </label>
          <input
            id="lf-name"
            type="text"
            placeholder="e.g., Mercer Salt Warehouse"
            {...register("name")}
            className="w-full mt-1 bg-transparent text-sm outline-none"
          />
          {errors.name && (
            <span className="text-xs text-red-600 block mt-1">
              {errors.name.message}
            </span>
          )}
        </div>

        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="lf-kind">
            Listing Type
          </label>
          <select
            id="lf-kind"
            value={selectedKind}
            onChange={(e) =>
              handleKindChange(e.target.value as "venue" | "vendor")
            }
            className="w-full mt-1 bg-transparent text-sm outline-none"
          >
            <option value="venue" className="bg-[var(--bg)]">
              Venue
            </option>
            <option value="vendor" className="bg-[var(--bg)]">
              Vendor
            </option>
          </select>
        </div>
      </div>

      <div className="border border-[var(--line)] p-3">
        <span className="label block mb-2">
          {selectedKind === "venue" ? "Venue Type" : "Vendor Service Category"}
        </span>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((cat) => {
            const active = activeCategoryObj?.slug === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-3 py-1.5 text-xs border transition-colors ${
                  active
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="lf-area">
            Neighborhood / Area
          </label>
          <input
            id="lf-area"
            type="text"
            placeholder="e.g., Waterfront"
            {...register("area")}
            className="w-full mt-1 bg-transparent text-sm outline-none"
          />
          {errors.area && (
            <span className="text-xs text-red-600 block mt-1">
              {errors.area.message}
            </span>
          )}
        </div>

        <div className="border border-[var(--line)] p-3 sm:col-span-2">
          <label className="label block" htmlFor="lf-address">
            Street Address (For Verification Visit)
          </label>
          <input
            id="lf-address"
            type="text"
            placeholder="Pier 9 North Basin, Waterfront"
            {...register("address")}
            className="w-full mt-1 bg-transparent text-sm outline-none"
          />
          {errors.address && (
            <span className="text-xs text-red-600 block mt-1">
              {errors.address.message}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="lf-guests">
            Max Guests
          </label>
          <input
            id="lf-guests"
            type="number"
            {...register("maxGuests", { valueAsNumber: true })}
            className="w-full mt-1 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="lf-price">
            Direct Base Price (USD)
          </label>
          <input
            id="lf-price"
            type="number"
            step={100}
            {...register("basePrice", { valueAsNumber: true })}
            className="w-full mt-1 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="lf-owner">
            Direct Owner Name
          </label>
          <input
            id="lf-owner"
            type="text"
            {...register("ownerName")}
            className="w-full mt-1 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="lf-contact-email">
            Contact Email (Shown on Listing)
          </label>
          <input
            id="lf-contact-email"
            type="email"
            placeholder="bookings@yourvenue.com"
            {...register("contactEmail")}
            className="w-full mt-1 bg-transparent text-sm outline-none"
          />
          {errors.contactEmail && (
            <span className="text-xs text-red-600 block mt-1">
              {errors.contactEmail.message}
            </span>
          )}
        </div>

        <div className="border border-[var(--line)] p-3">
          <label className="label block" htmlFor="lf-contact-phone">
            Contact Phone (Shown on Listing)
          </label>
          <input
            id="lf-contact-phone"
            type="tel"
            placeholder="+1 (555) 234-5678"
            {...register("contactPhone")}
            className="w-full mt-1 bg-transparent text-sm outline-none"
          />
          {errors.contactPhone && (
            <span className="text-xs text-red-600 block mt-1">
              {errors.contactPhone.message}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-[var(--line)] p-3">
          <span className="label block mb-2">Supported Event Types</span>
          <div className="flex flex-wrap gap-2">
            {(["Wedding", "Birthday", "Corporate"] as const).map((cat) => {
              const active = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 text-xs border transition-colors ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                      : "border-[var(--line)] text-[var(--muted)]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {selectedKind === "venue" && (
          <div className="border border-[var(--line)] p-3">
            <label className="label block" htmlFor="lf-dim">
              Room Dimensions &amp; Ceiling
            </label>
            <input
              id="lf-dim"
              type="text"
              {...register("dimensions")}
              className="w-full mt-1 bg-transparent text-sm outline-none"
            />
          </div>
        )}
      </div>

      {activeCategoryObj && (
        <div className="border border-[var(--line)] p-3">
          <span className="label block mb-2">
            {activeCategoryObj.optionsLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {activeCategoryObj.serviceOptions.map((opt) => {
              const active = selectedServiceOptions.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleServiceOption(opt)}
                  className={`px-3 py-1 text-xs border transition-colors ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                      : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="border border-[var(--line)] p-3">
        <label className="label block" htmlFor="lf-summary">
          Architectural &amp; Booking Summary
        </label>
        <textarea
          id="lf-summary"
          rows={2}
          placeholder="Describe natural light, load-in access, catering policy, and direct owner terms..."
          {...register("shortSummary")}
          className="w-full mt-1 bg-transparent text-sm outline-none resize-none"
        />
        {errors.shortSummary && (
          <span className="text-xs text-red-600 block mt-1">
            {errors.shortSummary.message}
          </span>
        )}
      </div>

      <MultiImageUploaderUI onImagesChange={setGalleryImages} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-filled"
      >
        {isSubmitting
          ? "Publishing to PostgreSQL..."
          : "Publish Direct Listing"}
      </button>
    </form>
  );
}
