"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getMarketplaceListingsAction,
  getMyListingsAction,
  MarketplaceQueryFilters,
} from "@/actions/listing.actions";
import { Listing } from "@/types";

export function useMarketplaceListings(
  filters?: MarketplaceQueryFilters,
  initialData?: Listing[]
) {
  return useQuery({
    queryKey: [
      "listings",
      filters?.category ?? "all",
      filters?.maxBudget ?? 12000,
      filters?.kindFilter ?? "all",
      filters?.selectedDate ?? "",
      filters?.searchQuery ?? "",
    ],
    queryFn: () => getMarketplaceListingsAction(filters),
    initialData,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useMyListings(enabled: boolean = true) {
  return useQuery({
    queryKey: ["my-listings"],
    queryFn: () => getMyListingsAction(),
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
