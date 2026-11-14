"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleSavedListing } from "@/store/slices/bookingDraftSlice";
import { toast } from "@/lib/toast";

interface HeartButtonProps {
  listingSlug: string;
  listingId?: string;
}

export default function HeartButton({ listingSlug }: HeartButtonProps) {
  const dispatch = useAppDispatch();
  const { savedSlugs } = useAppSelector((state) => state.bookingDraft);
  const hasFavorited = savedSlugs.includes(listingSlug);

  const toggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(toggleSavedListing(listingSlug));
    toast(
      hasFavorited
        ? "Removed from your saved shortlist"
        : "Saved to your shortlist!",
      {
        style: {
          background: "#FF5A5F",
          color: "white",
        },
      }
    );
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      aria-label={hasFavorited ? "Remove from favorites" : "Save to favorites"}
      className="relative hover:opacity-80 transition cursor-pointer p-2 rounded-full bg-black/35 backdrop-blur-xs text-white"
    >
      <Heart
        size={18}
        className={
          hasFavorited ? "fill-[#FF5A5F] text-[#FF5A5F]" : "text-white"
        }
      />
    </button>
  );
}
