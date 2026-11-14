"use client";

import React from "react";
import { MapPin } from "lucide-react";

interface MapComponentProps {
  center?: [number, number];
  price?: number;
  label?: string;
}

export default function MapComponent({
  center = [40.7081, -74.0018],
  price,
  label,
}: MapComponentProps) {
  const [lat, lng] = center;
  const bbox = `${lng - 0.025},${lat - 0.015},${lng + 0.025},${lat + 0.015}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="relative w-full h-full min-h-[260px] bg-[var(--soft)] overflow-hidden flex flex-col justify-between">
      <iframe
        title="Venue Location Map"
        src={osmEmbedUrl}
        className="w-full h-full min-h-[260px] border-0 pointer-events-auto"
        loading="lazy"
      />
      <div className="absolute top-3 left-3 z-10 bg-[var(--bg)]/95 border border-[var(--ink)] px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2 text-xs text-[var(--ink)]">
        <MapPin size={14} className="shrink-0" />
        <span className="font-medium">
          {label || `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`}
        </span>
        {typeof price === "number" && (
          <span className="ml-1 px-2 py-0.5 rounded bg-[var(--ink)] text-[var(--bg)] font-semibold">
            ${price.toLocaleString("en-US")}
          </span>
        )}
      </div>
    </div>
  );
}
