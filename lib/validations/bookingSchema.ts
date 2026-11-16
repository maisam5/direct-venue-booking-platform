import { z } from "zod";

export const bookingSchema = z.object({
  listingId: z.string().min(1, "Listing is required"),
  packageId: z.string(),
  eventCategory: z.enum(["Wedding", "Birthday", "Corporate"]),
  eventDate: z.string().min(1, "Please choose an available date"),
  guestCount: z
    .number()
    .int()
    .min(1, "Minimum 1 guest")
    .max(100000, "Exceeds maximum capacity"),
  plannerName: z.string().min(2, "Your full name is required"),
  plannerEmail: z.string().email("Enter a valid email address"),
  plannerPhone: z.string().min(5, "Enter a direct phone number for the owner"),
  selectedAddOnIds: z.array(z.string()),
  notes: z.string().max(600, "Keep your note under 600 characters").optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
