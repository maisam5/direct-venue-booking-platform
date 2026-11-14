"use client";

import React, { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useFilterModal } from "@/store/useFilterListingModal";
import { useAppDispatch } from "@/store";
import {
  setKindFilter,
  setMaxBudget,
  setMinBudget,
  setSearchQuery,
} from "@/store/slices/filterSlice";
import Modal from "./Modal";
import useCountries, { Country } from "@/custom-hooks/useCountries";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { categories } from "@/constants/Categories";
import CategoryCard from "@/components/listings/CategoryCard";
import CountrySelect from "@/components/listings/CountrySelect";

const MapComponent = dynamic(
  () => import("@/components/general/map/MapComponent"),
  {
    ssr: false,
    loading: () => <p className="text-center py-6">Loading map...</p>,
  }
);

const STEPS = {
  CATEGORY: 0,
  LOCATION: 1,
  PRICE: 2,
};

function FilterModalComponent() {
  const { getByValue } = useCountries();
  const searchParams = useSearchParams();
  const { isOpen, close } = useFilterModal();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [step, setStep] = useState(STEPS.CATEGORY);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const getLocationFromParams = () => {
    const value = searchParams.get("locationValue");
    if (!value) return null;
    return getByValue(value) ?? null;
  };

  const [location, setLocation] = useState<null | Country>(
    getLocationFromParams()
  );

  const stepTitle = () => {
    switch (step) {
      case STEPS.CATEGORY:
        return "Select a category";
      case STEPS.LOCATION:
        return "Select a location";
      case STEPS.PRICE:
        return "Select a price range";
      default:
        return "";
    }
  };

  const onApplyFilters = () => {
    const params = new URLSearchParams();

    if (category) {
      params.set("category", category);
      const matched = categories.find((c) => c.slug === category);
      if (matched) {
        dispatch(setKindFilter(matched.kind));
      }
    }
    if (location) {
      params.set("locationValue", location.value);
      dispatch(setSearchQuery(location.value));
    }
    if (minPrice) {
      params.set("minPrice", minPrice);
      dispatch(setMinBudget(Number(minPrice)));
    }
    if (maxPrice) {
      params.set("maxPrice", maxPrice);
      dispatch(setMaxBudget(Number(maxPrice)));
    }

    router.push(`/explore?${params.toString()}`);
    setStep(STEPS.CATEGORY);
    close();
  };

  const disableFilterButton =
    !category && !location && !minPrice && !maxPrice && step === STEPS.PRICE;

  return (
    <Modal title="Filter Listings" isOpen={isOpen} onClose={close}>
      {/* step indicator */}
      <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        <span>Step {step + 1} of 3</span>
        <span className="font-semibold text-[var(--ink)]">{stepTitle()}</span>
      </div>

      <div className="min-h-[240px] flex items-center justify-center rounded-xl text-[var(--ink)] py-2">
        {step === STEPS.CATEGORY && (
          <div className="grid grid-cols-2 gap-3 w-full max-h-[320px] overflow-y-auto pr-1">
            {categories.map((item) => (
              <CategoryCard
                label={item.label}
                icon={item.icon}
                description={item.description}
                key={item.slug}
                onClick={() =>
                  setCategory((prev) => (prev === item.slug ? "" : item.slug))
                }
                selected={category === item.slug}
              />
            ))}
          </div>
        )}

        {step === STEPS.LOCATION && (
          <div className="w-full space-y-3 py-2">
            <CountrySelect
              value={location}
              onChange={(value) => setLocation(value)}
            />

            <div className="h-64 rounded-xl overflow-hidden border border-[var(--line)]">
              <MapComponent
                center={location?.latlng || [40.7081, -74.0018]}
                label={
                  location
                    ? `${location.label} (${location.region})`
                    : "All Verified Districts"
                }
              />
            </div>
          </div>
        )}

        {step === STEPS.PRICE && (
          <div className="grid grid-cols-2 gap-4 w-full">
            <div>
              <Input
                label="Min Price ($)"
                name="min-price"
                type="number"
                placeholder="100"
                value={minPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setMinPrice(e.target.value);
                }}
              />
            </div>
            <div>
              <Input
                label="Max Price ($)"
                name="max-price"
                type="number"
                placeholder="12000"
                value={maxPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setMaxPrice(e.target.value);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* footer */}
      <div className="mt-7 flex gap-3">
        {step > STEPS.CATEGORY && (
          <Button
            onClick={() => setStep((prev) => prev - 1)}
            variant="outline"
          >
            Back
          </Button>
        )}

        <Button
          disabled={disableFilterButton}
          onClick={() =>
            step < STEPS.PRICE ? setStep((prev) => prev + 1) : onApplyFilters()
          }
        >
          {step === STEPS.PRICE ? "Apply Filter" : "Next"}
        </Button>
      </div>
    </Modal>
  );
}

export default function FilterModal() {
  return (
    <Suspense>
      <FilterModalComponent />
    </Suspense>
  );
}
