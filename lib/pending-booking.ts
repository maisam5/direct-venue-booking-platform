import { BookingFormValues } from "@/lib/validations/bookingSchema";
import { completeOnboardingAction } from "@/actions/auth.actions";
import { createDirectBooking } from "@/actions/booking.actions";
import { BookingRequest } from "@/types";

export const PENDING_BOOKING_STORAGE_KEY = "mgevents_pending_booking";

export interface PendingBookingPayload extends BookingFormValues {
  calculatedTotal?: number;
  listingSlug: string;
  listingName: string;
  ownerName: string;
  createdAt: number;
}

export function savePendingBooking(payload: PendingBookingPayload): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PENDING_BOOKING_STORAGE_KEY,
      JSON.stringify(payload)
    );
  } catch {
    // ignore storage errors
  }
}

export function clearPendingBooking(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PENDING_BOOKING_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

export function peekPendingBooking(): PendingBookingPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PENDING_BOOKING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingBookingPayload;
    if (
      !parsed ||
      !parsed.listingId ||
      Date.now() - (parsed.createdAt || 0) > 60 * 60 * 1000
    ) {
      window.localStorage.removeItem(PENDING_BOOKING_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export interface PendingBookingResult {
  executed: boolean;
  success: boolean;
  booking?: BookingRequest;
  error?: string;
  pending?: PendingBookingPayload;
}

let inFlightPromise: Promise<PendingBookingResult> | null = null;

export function executePendingBookingOnce(userInfo?: {
  fullName?: string | null;
  firstName?: string | null;
  email?: string | null;
  phone?: string | null;
}): Promise<PendingBookingResult> {
  if (inFlightPromise) {
    return inFlightPromise;
  }

  const pending = peekPendingBooking();
  if (!pending) {
    return Promise.resolve({ executed: false, success: false });
  }

  inFlightPromise = (async (): Promise<PendingBookingResult> => {
    try {
      await completeOnboardingAction({ role: "PLANNER" }).catch(() => null);

      const fallbackName =
        pending.plannerName?.trim() ||
        userInfo?.fullName?.trim() ||
        userInfo?.firstName?.trim() ||
        "Verified Planner";
      const fallbackEmail =
        pending.plannerEmail?.trim() ||
        userInfo?.email?.trim() ||
        "planner@mgevents.local";
      const fallbackPhone =
        pending.plannerPhone && pending.plannerPhone.trim().length >= 5
          ? pending.plannerPhone.trim()
          : userInfo?.phone?.trim() || "+92 300 0000000";

      const response = await createDirectBooking({
        listingId: pending.listingId,
        packageId: pending.packageId || "default-package",
        eventCategory: pending.eventCategory || "Wedding",
        eventDate: pending.eventDate || "2026-12-18",
        guestCount: Math.max(1, Number(pending.guestCount) || 50),
        plannerName: fallbackName,
        plannerEmail: fallbackEmail,
        plannerPhone: fallbackPhone,
        selectedAddOnIds: pending.selectedAddOnIds || [],
        notes: pending.notes || "",
        calculatedTotal: pending.calculatedTotal,
      });

      clearPendingBooking();

      if (!response.success || !response.booking) {
        return {
          executed: true,
          success: false,
          error:
            response.error ||
            "This date was just reserved or blocked by the owner",
          pending,
        };
      }

      return {
        executed: true,
        success: true,
        booking: response.booking,
        pending,
      };
    } catch (err) {
      clearPendingBooking();
      return {
        executed: true,
        success: false,
        error:
          err instanceof Error ? err.message : "Could not complete booking",
        pending,
      };
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}
