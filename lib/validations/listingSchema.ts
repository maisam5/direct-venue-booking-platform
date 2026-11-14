import { z } from "zod";

export const listingSchema = z.object({
  name: z.string().min(3, "Venue or vendor name must be at least 3 characters"),
  kind: z.enum(["venue", "vendor"]),
  area: z.string().min(2, "Neighborhood / area is required"),
  address: z.string().min(5, "Street address is required for on-site verification"),
  maxGuests: z.number().int().min(10, "Capacity must be at least 10 guests").max(2000),
  basePrice: z.number().min(100, "Starting price must be at least $100"),
  categories: z
    .array(z.enum(["Wedding", "Birthday", "Corporate"]))
    .min(1, "Select at least one supported event type"),
  ownerName: z.string().min(2, "Direct owner name is required"),
  contactEmail: z.string().email("Enter a valid contact email"),
  contactPhone: z.string().min(7, "Enter a valid contact phone number"),
  shortSummary: z.string().min(20, "Provide a concise architectural or service summary"),
  dimensions: z.string().min(4, "Provide room dimensions or service coverage"),
});

export type ListingFormValues = z.infer<typeof listingSchema>;
