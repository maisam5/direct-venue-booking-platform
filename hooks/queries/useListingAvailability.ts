"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getListingAvailabilityAction,
  toggleDateAvailability,
} from "@/actions/availability.actions";
import { AvailabilitySlot } from "@/types";

export function useListingAvailability(
  listingId: string,
  month: string = "2026-12",
  initialData?: AvailabilitySlot[]
) {
  return useQuery({
    queryKey: ["availability", listingId, month],
    queryFn: () => getListingAvailabilityAction(listingId, month),
    enabled: Boolean(listingId),
    initialData,
    placeholderData: initialData,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useToggleDateMutation(
  listingId: string,
  month: string = "2026-12"
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleDateAvailability,
    onMutate: async (variables) => {
      const queryKey = ["availability", listingId, month];
      await queryClient.cancelQueries({ queryKey });
      const previousSlots =
        queryClient.getQueryData<AvailabilitySlot[]>(queryKey);

      if (previousSlots) {
        const existing = previousSlots.find((s) => s.date === variables.date);
        if (existing && existing.status === "booked") {
          return { previousSlots };
        }
        const nextStatus: "available" | "blocked" =
          existing && existing.status === "blocked" ? "available" : "blocked";

        const nextSlots = existing
          ? previousSlots.map((s) =>
              s.date === variables.date
                ? {
                    ...s,
                    status: nextStatus,
                    note: nextStatus === "blocked" ? "Owner Hold" : undefined,
                  }
                : s
            )
          : [
              ...previousSlots,
              {
                date: variables.date,
                status: nextStatus,
                note: nextStatus === "blocked" ? "Owner Hold" : undefined,
              },
            ];

        queryClient.setQueryData<AvailabilitySlot[]>(queryKey, nextSlots);
      }

      return { previousSlots };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousSlots) {
        queryClient.setQueryData(
          ["availability", listingId, month],
          context.previousSlots
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["availability", listingId, month],
      });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
