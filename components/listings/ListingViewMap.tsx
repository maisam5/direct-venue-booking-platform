"use client";

import useCountries from "@/custom-hooks/useCountries";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("../general/map/MapComponent"), {
  ssr: false,
  loading: () => <p className="text-center py-6">Loading map...</p>,
});

interface ListingViewMapProps {
  price: number;
  locationValue: string;
}

export default function ListingViewMap({
  price,
  locationValue,
}: ListingViewMapProps) {
  const { getByValue } = useCountries();
  const location = getByValue(locationValue);

  if (!location) return null;
  return (
    <div className="h-80 rounded-xl overflow-hidden border border-[var(--line)]">
      <MapComponent
        price={price}
        center={location.latlng}
        label={`${location.label} · ${location.region}`}
      />
    </div>
  );
}
