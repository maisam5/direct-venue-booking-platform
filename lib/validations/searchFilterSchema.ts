import { z } from "zod";

export const searchFilterSchema = z.object({
  category: z.enum(["all", "Wedding", "Birthday", "Corporate"]),
  minBudget: z.number().min(0),
  maxBudget: z.number().min(500).max(25000),
  guestRange: z.string(),
  selectedDate: z.string().optional(),
  searchQuery: z.string().optional(),
});

export type SearchFilterValues = z.infer<typeof searchFilterSchema>;
