"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBookingsAction,
  updateBookingStatusAction,
} from "@/actions/booking.actions";
import { BookingRequest } from "@/types";

export function useBookings(initialData?: BookingRequest[]) {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () => getBookingsAction(),
    initialData,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateBookingStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBookingStatusAction,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["bookings"] });
      const previousBookings =
        queryClient.getQueryData<BookingRequest[]>(["bookings"]);

      const statusLabelMap: Record<
        typeof variables.newStatus,
        BookingRequest["status"]
      > = {
        CONFIRMED: "Confirmed",
        PENDING: "Pending Owner Reply",
        DECLINED: "Declined",
        CANCELLED: "Cancelled",
      };

      if (previousBookings) {
        queryClient.setQueryData<BookingRequest[]>(
          ["bookings"],
          previousBookings.map((b) =>
            b.id === variables.bookingId
              ? {
                  ...b,
                  dbStatus: variables.newStatus,
                  status: statusLabelMap[variables.newStatus],
                  ownerResponseNote:
                    variables.ownerResponseNote ?? b.ownerResponseNote,
                }
              : b
          )
        );
      }

      return { previousBookings };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(["bookings"], context.previousBookings);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
