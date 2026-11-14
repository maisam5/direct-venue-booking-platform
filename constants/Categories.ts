import {
  Building2,
  Trees,
  Sparkles,
  Castle,
  UtensilsCrossed,
  Camera,
  Flower2,
  Music,
  LucideIcon,
} from "lucide-react";

export interface CounterFieldConfig {
  label: string;
  subtitle: string;
  min: number;
  step: number;
  defaultValue: number;
}

export interface CategoryItem {
  label: string;
  slug: string;
  icon: LucideIcon;
  kind: "venue" | "vendor";
  prismaCategory:
    | "VENUE"
    | "CATERING"
    | "PHOTOGRAPHY"
    | "DECOR"
    | "ENTERTAINMENT";
  description: string;
  optionsLabel: string;
  serviceOptions: string[];
  counters: {
    guests: CounterFieldConfig | null;
    primary: CounterFieldConfig | null;
    secondary: CounterFieldConfig | null;
  };
}

const VENUE_COUNTERS: CategoryItem["counters"] = {
  guests: {
    label: "Guests",
    subtitle: "How many guests can your venue accommodate?",
    min: 10,
    step: 10,
    defaultValue: 160,
  },
  primary: {
    label: "Rooms / Event Spaces",
    subtitle: "How many halls, rooms, or setups are available?",
    min: 1,
    step: 1,
    defaultValue: 2,
  },
  secondary: {
    label: "Bathrooms / Restrooms",
    subtitle: "How many guest restrooms or dressing suites?",
    min: 1,
    step: 1,
    defaultValue: 2,
  },
};

const VENUE_OPTIONS = [
  "Valet Parking",
  "Bridal / VIP Suite",
  "In-House Sound & Lighting",
  "Outdoor Lawn / Courtyard",
  "Backup Power Generator",
  "Catering Prep Kitchen",
];

export const categories: CategoryItem[] = [
  {
    label: "Wedding Hall",
    slug: "wedding-hall",
    icon: Building2,
    kind: "venue",
    prismaCategory: "VENUE",
    description: "Grand banquet halls, ballrooms & wedding venues",
    optionsLabel: "Venue Amenities & Features",
    serviceOptions: VENUE_OPTIONS,
    counters: VENUE_COUNTERS,
  },
  {
    label: "Farm House",
    slug: "farm-house",
    icon: Trees,
    kind: "venue",
    prismaCategory: "VENUE",
    description: "Lush countryside estates, lawns & outdoor pavilions",
    optionsLabel: "Venue Amenities & Features",
    serviceOptions: VENUE_OPTIONS,
    counters: VENUE_COUNTERS,
  },
  {
    label: "Rooftop",
    slug: "rooftop",
    icon: Sparkles,
    kind: "venue",
    prismaCategory: "VENUE",
    description: "Skyline penthouses & open-air rooftop decks",
    optionsLabel: "Venue Amenities & Features",
    serviceOptions: VENUE_OPTIONS,
    counters: VENUE_COUNTERS,
  },
  {
    label: "Historic Manor",
    slug: "historic-manor",
    icon: Castle,
    kind: "venue",
    prismaCategory: "VENUE",
    description: "Heritage mansions, libraries & ballrooms",
    optionsLabel: "Venue Amenities & Features",
    serviceOptions: VENUE_OPTIONS,
    counters: VENUE_COUNTERS,
  },
  {
    label: "Catering & Culinary",
    slug: "catering-culinary",
    icon: UtensilsCrossed,
    kind: "vendor",
    prismaCategory: "CATERING",
    description: "Wood-fired banquets, tasting menus & bars",
    optionsLabel: "Catering & Menu Options",
    serviceOptions: [
      "Live Cooking Stations",
      "Buffet & Plated Service",
      "Waitstaff & Servers Included",
      "Custom Tasting Session",
      "Crockery, Cutlery & Glassware",
      "Halal & Dietary Menus",
      "Mocktail & Beverage Bar",
    ],
    counters: {
      guests: {
        label: "Max Guests Served",
        subtitle: "Maximum guest count per event for your culinary team",
        min: 20,
        step: 10,
        defaultValue: 200,
      },
      primary: {
        label: "Chefs & Service Staff",
        subtitle: "How many chefs, servers, and stewards are included?",
        min: 1,
        step: 1,
        defaultValue: 6,
      },
      secondary: null,
    },
  },
  {
    label: "Photography & Film",
    slug: "photography-film",
    icon: Camera,
    kind: "vendor",
    prismaCategory: "PHOTOGRAPHY",
    description: "Editorial documentary stills & cinema",
    optionsLabel: "Photography & Film Deliverables",
    serviceOptions: [
      "Candid & Editorial Stills",
      "4K Cinematic Highlight Film",
      "Drone Aerial Coverage",
      "Same-Day Edit / Teaser",
      "Pre-Event / Couple Shoot",
      "Fine-Art Printed Album",
      "Edited Online Gallery",
    ],
    counters: {
      guests: null,
      primary: {
        label: "Photographers & Filmmakers",
        subtitle: "How many shooters / crew members are in this package?",
        min: 1,
        step: 1,
        defaultValue: 2,
      },
      secondary: {
        label: "Coverage Hours",
        subtitle: "Standard hours of event coverage included",
        min: 2,
        step: 1,
        defaultValue: 8,
      },
    },
  },
  {
    label: "Florals & Decor",
    slug: "floral-decor",
    icon: Flower2,
    kind: "vendor",
    prismaCategory: "DECOR",
    description: "Botanical installations, lighting & styling",
    optionsLabel: "Florals & Decor Services",
    serviceOptions: [
      "Fresh Floral Stage & Backdrop",
      "Ceremony Arch / Mandap",
      "Ambient & Fairy Lighting",
      "Table Centerpieces & Linens",
      "Custom Theme & Moodboard",
      "Entrance & Walkway Styling",
      "Full Setup & Teardown",
    ],
    counters: {
      guests: null,
      primary: {
        label: "Setup Crew Size",
        subtitle: "How many florists and installation crew members?",
        min: 1,
        step: 1,
        defaultValue: 4,
      },
      secondary: {
        label: "Decor Zones / Installations",
        subtitle: "Stage, entrance, tables, and lounge zones covered",
        min: 1,
        step: 1,
        defaultValue: 3,
      },
    },
  },
  {
    label: "Sound, DJ & Live Music",
    slug: "live-sound-dj",
    icon: Music,
    kind: "vendor",
    prismaCategory: "ENTERTAINMENT",
    description: "Bespoke acoustics, vinyl sets & ensembles",
    optionsLabel: "Sound, DJ & Lighting Options",
    serviceOptions: [
      "Pro PA & Line-Array Sound",
      "Live DJ & MC Hosting",
      "Dancefloor & Club Lighting",
      "Live Band / Acoustic Set",
      "Wireless Mics & Stage Audio",
      "Custom Playlist & Soundcheck",
      "Backup Audio Rig",
    ],
    counters: {
      guests: {
        label: "Max Crowd / Venue Size",
        subtitle: "Maximum audience size your sound rig comfortably covers",
        min: 20,
        step: 20,
        defaultValue: 250,
      },
      primary: {
        label: "DJs / Performers & Techs",
        subtitle: "Number of artists and audio engineers included",
        min: 1,
        step: 1,
        defaultValue: 2,
      },
      secondary: {
        label: "Performance Hours",
        subtitle: "Standard live music / DJ set duration",
        min: 2,
        step: 1,
        defaultValue: 5,
      },
    },
  },
];

export function getCategoryBySlug(slug: string | null | undefined): CategoryItem | undefined {
  if (!slug) return undefined;
  return categories.find((c) => c.slug === slug);
}

export function buildListingAmenities(params: {
  category?: CategoryItem;
  roomCount: number;
  bathroomCount: number;
  serviceOptions?: string[];
}): string[] {
  const { category, roomCount, bathroomCount, serviceOptions = [] } = params;
  const amenities: string[] = [];

  if (!category || category.kind === "venue") {
    amenities.push(
      `${roomCount} Event ${roomCount === 1 ? "Space" : "Spaces"} · ${bathroomCount} ${
        bathroomCount === 1 ? "Restroom" : "Restrooms"
      }`
    );
  } else {
    if (category.counters.primary) {
      amenities.push(`${roomCount} ${category.counters.primary.label}`);
    }
    if (category.counters.secondary) {
      amenities.push(`${bathroomCount} ${category.counters.secondary.label}`);
    }
  }

  for (const opt of serviceOptions) {
    if (opt && !amenities.includes(opt)) {
      amenities.push(opt);
    }
  }

  amenities.push(`Category: ${category?.label || "Direct Venue"}`);
  amenities.push("Direct owner terms · 0% commission");
  return amenities;
}
