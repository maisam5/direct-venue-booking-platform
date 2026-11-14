import { Listing, BookingRequest } from "@/types";

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: "venue-atlas-loft",
    slug: "atlas-loft",
    indexNumber: "01",
    name: "Atlas Loft",
    kind: "venue",
    area: "Downtown",
    address: "412 Mercer Street, Penthouse B, Downtown",
    maxGuests: 90,
    basePrice: 1500,
    priceUnitLabel: "$1,500",
    categories: ["Corporate", "Birthday"],
    availabilityLabel: "Open this week",
    verified: true,
    verifiedDate: "Visited Oct 18, 2026",
    ownerName: "Marcus Vance",
    ownerRole: "Building Principal & Resident Architect",
    ownerResponseTime: "Replies within 2 hours",
    shortSummary:
      "Sun-drenched fourth-floor timber loft with 16-foot factory casements, poured terrazzo floors, and an open chef’s prep island.",
    description:
      "Originally a 1924 mapmaking bindery, Atlas Loft spans 2,800 square feet of column-free space in the heart of Downtown. You deal directly with Marcus—no venue coordinators taking a 22% service cut, and no mandatory catering minimums.",
    architecturalNotes:
      "2,800 sq ft · North & West daylight exposure · Dedicated freight elevator",
    dimensions: "70 ft × 40 ft · 16 ft ceiling height",
    coverImage:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    ],
    packages: [
      {
        id: "pkg-atlas-half",
        name: "Daylight Session (6 hrs)",
        description:
          "Ideal for offsites, press launches, and milestone afternoon gatherings.",
        price: 1500,
        priceType: "flat",
        maxGuests: 90,
        includedFeatures: [
          "Exclusive loft access (9:00 AM – 3:00 PM)",
          "Custom modular oak tables & 90 architectural chairs",
          "10 Gbps fiber & 4K laser projection wall",
          "Direct owner key-handoff & post-event standard cleaning",
        ],
      },
      {
        id: "pkg-atlas-full",
        name: "Full Evening Buyout (10 hrs)",
        description:
          "Complete private access through midnight with rooftop terrace entry.",
        price: 2200,
        priceType: "flat",
        maxGuests: 90,
        includedFeatures: [
          "Exclusive loft + west terrace access (2:00 PM – 12:00 AM)",
          "Commercial scullery & induction prep kitchen",
          "Integrated Dieter Rams-inspired house sound system",
          "BYO beverage policy with zero corkage fee",
        ],
      },
    ],
    addOns: [
      {
        id: "add-atlas-lighting",
        name: "Architectural Warm Wash Rig",
        description: "Tunable 2700K perimeter uplighting pre-set before arrival.",
        price: 250,
      },
      {
        id: "add-atlas-attendant",
        name: "Dedicated Coat & Door Host",
        description: "Owner-employed lobby attendant for guest arrival window.",
        price: 180,
      },
    ],
    availability: [
      { date: "2026-12-05", status: "booked", note: "Private 40th Dinner" },
      { date: "2026-12-06", status: "available" },
      { date: "2026-12-10", status: "available" },
      { date: "2026-12-12", status: "booked", note: "Design Studio Summit" },
      { date: "2026-12-14", status: "available" },
      { date: "2026-12-18", status: "available" },
      { date: "2026-12-19", status: "blocked", note: "Floor wax maintenance" },
    ],
    galleryCaptions: [
      {
        title: "Main Hall · West Casements",
        aspect: "4/5",
        note: "Natural afternoon light at 4:00 PM",
      },
      {
        title: "Scullery & Pour Bar",
        aspect: "16/10",
        note: "Monolithic stainless island",
      },
      {
        title: "Long Table Configuration",
        aspect: "16/10",
        note: "Seats 72 for seated dinner",
      },
    ],
  },
  {
    id: "venue-marlowe-gardens",
    slug: "marlowe-gardens",
    indexNumber: "02",
    name: "Marlowe Gardens",
    kind: "venue",
    area: "Riverside",
    address: "88 Riverbend Conservatory Lane, Riverside",
    maxGuests: 120,
    basePrice: 2400,
    priceUnitLabel: "$2,400",
    categories: ["Birthday", "Wedding"],
    availabilityLabel: "Open Dec 8",
    verified: true,
    verifiedDate: "Visited Nov 02, 2026",
    ownerName: "Elena & Hugh Marlowe",
    ownerRole: "Resident Botanists & Proprietors",
    ownerResponseTime: "Replies within 3 hours",
    shortSummary:
      "Glass-roofed Victorian orangery and walled fig courtyard overlooking the quiet bend of the river.",
    description:
      "Heated year-round under wrought-iron glazing, Marlowe Gardens pairs a 19th-century botanical conservatory with a limestone courtyard. Elena and Hugh host one event per weekend so you have unhurried morning setup.",
    architecturalNotes:
      "3,400 sq ft under glass · Heated limestone floor · Private riverside lawn",
    dimensions: "85 ft × 40 ft orangery + 4,000 sq ft courtyard",
    coverImage:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=80",
    ],
    packages: [
      {
        id: "pkg-marlowe-day",
        name: "Conservatory Gathering (8 hrs)",
        description:
          "Ceremony and reception access across the glasshouse and river lawn.",
        price: 2400,
        priceType: "flat",
        maxGuests: 120,
        includedFeatures: [
          "8 hours exclusive access to Orangery & Walled Courtyard",
          "Bentwood dining chairs & linen-ready banquet tables for 120",
          "Private bridal/green suite in the Gatehouse",
          "Zero commission on external caterers or florists",
        ],
      },
      {
        id: "pkg-marlowe-weekend",
        name: "Full Day + Rehearsal Hour (12 hrs)",
        description:
          "Extended access from 11:00 AM to 11:00 PM plus prior-day walkthrough.",
        price: 3400,
        priceType: "flat",
        maxGuests: 120,
        includedFeatures: [
          "12 hours full estate access",
          "Outdoor cedar fire bowls lit at dusk",
          "Climate-controlled wine storage room",
          "Direct walk-through with Elena Marlowe",
        ],
      },
    ],
    addOns: [
      {
        id: "add-marlowe-fire",
        name: "Courtyard Brazier Service",
        description: "Seasoned birch firewood and tending for 4 hours.",
        price: 220,
      },
      {
        id: "add-marlowe-pianos",
        name: "1968 Bechstein Upright Tuning",
        description: "Fresh day-of concert tuning for the conservatory piano.",
        price: 190,
      },
    ],
    availability: [
      { date: "2026-12-08", status: "available" },
      { date: "2026-12-12", status: "booked", note: "Winter Ceremony" },
      { date: "2026-12-14", status: "available" },
      { date: "2026-12-16", status: "available" },
      { date: "2026-12-19", status: "blocked", note: "Solstice Supper" },
      { date: "2026-12-22", status: "available" },
    ],
    galleryCaptions: [
      {
        title: "The Glass Orangery",
        aspect: "4/5",
        note: "Heated year-round for winter receptions",
      },
      {
        title: "Walled Fig Courtyard",
        aspect: "16/10",
        note: "Limestone terrace for cocktail hour",
      },
      {
        title: "Gatehouse Suite",
        aspect: "16/10",
        note: "Quiet dressing room with private garden door",
      },
    ],
  },
  {
    id: "venue-the-foundry",
    slug: "the-foundry",
    indexNumber: "03",
    name: "The Foundry",
    kind: "venue",
    area: "Old Town",
    address: "19 Ironworks Alley, Old Town",
    maxGuests: 250,
    basePrice: 3600,
    priceUnitLabel: "$3,600",
    categories: ["Corporate", "Birthday"],
    availabilityLabel: "Open Dec 12",
    verified: true,
    verifiedDate: "Visited Oct 29, 2026",
    ownerName: "Soren Lindqvist",
    ownerRole: "Managing Co-Owner",
    ownerResponseTime: "Replies within 1 hour",
    shortSummary:
      "Monumental brick-and-steel crane hall with acoustic timber baffles, drive-in loading bay, and mezzanine bar.",
    description:
      "Built for heavy cast-iron fabrication in 1908, The Foundry offers 6,200 square feet of raw architectural volume softened by Danish acoustic oak paneling. Book directly with Soren for transparent flat-rate hall rental.",
    architecturalNotes:
      "6,200 sq ft · 28 ft steel truss roof · Street-level vehicle roll-up door",
    dimensions: "110 ft × 56 ft + Mezzanine",
    coverImage:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1400&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
    ],
    packages: [
      {
        id: "pkg-foundry-standard",
        name: "Main Crane Hall (10 hrs)",
        description:
          "Full floor and mezzanine access for conferences, galas, or milestone nights.",
        price: 3600,
        priceType: "flat",
        maxGuests: 250,
        includedFeatures: [
          "10 hours private access including load-in",
          "3-phase 200A production power drop included",
          "Mezzanine espresso & cocktail bar fixture",
          "Zero markup on AV or catering vendors",
        ],
      },
      {
        id: "pkg-foundry-production",
        name: "24-Hour Production Hold",
        description:
          "Full day-to-day lock for elaborate staging or corporate town halls.",
        price: 4900,
        priceType: "flat",
        maxGuests: 250,
        includedFeatures: [
          "24-hour key lock from 8:00 AM",
          "Scissor-lift access for truss rigging",
          "Green rooms A & B + private shower suites",
          "On-site facilities engineer throughout",
        ],
      },
    ],
    addOns: [
      {
        id: "add-foundry-stage",
        name: "Modular Steel Riser Deck (24×12 ft)",
        description: "Configured at 18\" or 24\" height prior to load-in.",
        price: 400,
      },
      {
        id: "add-foundry-valet",
        name: "Private Courtyard Parking Lot",
        description: "Reserved 35-car gated lot adjacent to West entrance.",
        price: 350,
      },
    ],
    availability: [
      { date: "2026-12-05", status: "blocked", note: "Architecture Lecture" },
      { date: "2026-12-12", status: "available" },
      { date: "2026-12-13", status: "available" },
      { date: "2026-12-14", status: "available" },
      { date: "2026-12-21", status: "available" },
    ],
    galleryCaptions: [
      {
        title: "The Gantry Nave",
        aspect: "4/5",
        note: "28-foot clear span with original bridge crane",
      },
      {
        title: "Acoustic Mezzanine",
        aspect: "16/10",
        note: "Overlooks the main dining floor",
      },
      {
        title: "Courtyard Roll-Up Gate",
        aspect: "16/10",
        note: "Direct step-free arrival from Ironworks Alley",
      },
    ],
  },
  {
    id: "venue-harbor-hall",
    slug: "harbor-hall",
    indexNumber: "04",
    name: "Harbor Hall",
    kind: "venue",
    area: "Waterfront",
    address: "Pier 7 North Basin, Waterfront",
    maxGuests: 300,
    basePrice: 4800,
    priceUnitLabel: "$4,800",
    categories: ["Wedding", "Corporate"],
    availabilityLabel: "Open Dec 14",
    verified: true,
    verifiedDate: "Visited Nov 05, 2026",
    ownerName: "Clara Chen-strom",
    ownerRole: "Harbor Trust Owner-Operator",
    ownerResponseTime: "Replies within 1 hour",
    shortSummary:
      "Vaulted masonry pier house with triple-arch harbor windows, cedar plank deck, and unobstructed water views.",
    description:
      "Featured on our cover, Harbor Hall sits directly over the North Basin pilings. Three 22-foot masonry arches frame passing sailboats and evening water reflections. Clara manages bookings personally with a strict single-event-per-day policy.",
    architecturalNotes:
      "7,500 sq ft · Triple masonry arches · 120-foot over-water promenade",
    dimensions: "125 ft × 60 ft · 24 ft vaulted ceiling",
    coverImage:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80",
    ],
    packages: [
      {
        id: "pkg-harbor-classic",
        name: "Arch Hall & Pier Deck (10 hrs)",
        description:
          "Complete waterfront buyout for weddings and keynote dinners up to 300 guests.",
        price: 4800,
        priceType: "flat",
        maxGuests: 300,
        includedFeatures: [
          "Exclusive use of Main Arch Hall & Over-Water Promenade",
          "300 solid ash dining chairs & 36 banquet tables",
          "Full commercial catering kitchen with separate service corridor",
          "Direct owner contract — $0 agency or platform fee",
        ],
      },
      {
        id: "pkg-harbor-extended",
        name: "Harbor Grand Weekend (14 hrs)",
        description:
          "Morning-to-midnight access plus private water-taxi landing slip.",
        price: 6200,
        priceType: "flat",
        maxGuests: 300,
        includedFeatures: [
          "14 hours exclusive pier access (10:00 AM – 12:00 AM)",
          "Private mooring slip for guest charter boat arrival",
          "Two harbor-facing dressing salons",
          "Dedicated dockmaster & post-event deep clean",
        ],
      },
    ],
    addOns: [
      {
        id: "add-harbor-slip",
        name: "Private Launch Mooring Permit",
        description: "Docking clearance at Pier 7 North Slip for wooden launch.",
        price: 300,
      },
      {
        id: "add-harbor-heaters",
        name: "Promenade Marine Heaters (Set of 8)",
        description: "Flush-mounted infrared deck heating for winter water views.",
        price: 420,
      },
    ],
    availability: [
      { date: "2026-12-06", status: "booked", note: "Claire & Daniel Wedding" },
      { date: "2026-12-12", status: "blocked", note: "Owner Hold" },
      { date: "2026-12-14", status: "available" },
      { date: "2026-12-15", status: "available" },
      { date: "2026-12-18", status: "available" },
      { date: "2026-12-20", status: "available" },
    ],
    galleryCaptions: [
      {
        title: "Harbor Hall · Open Dec 14",
        aspect: "4/5",
        note: "Signature triple masonry arches facing West",
      },
      {
        title: "North Basin Promenade",
        aspect: "16/10",
        note: "120-foot cedar deck directly over the water",
      },
      {
        title: "East Vault Dining Room",
        aspect: "16/10",
        note: "Accommodates 300 seated guests with dance floor",
      },
    ],
  },
  {
    id: "venue-linden-estate",
    slug: "linden-estate",
    indexNumber: "05",
    name: "Linden Estate",
    kind: "venue",
    area: "North Hills",
    address: "1400 Linden Ridge Road, North Hills",
    maxGuests: 180,
    basePrice: 7200,
    priceUnitLabel: "$7,200",
    categories: ["Wedding", "Birthday"],
    availabilityLabel: "Few dates left",
    verified: true,
    verifiedDate: "Visited Oct 11, 2026",
    ownerName: "Arthur & Maeve Sterling",
    ownerRole: "Estate Stewards",
    ownerResponseTime: "Replies within 2 hours",
    shortSummary:
      "1932 limestone manor house, sunken hornbeam parterre, and timber carriage barn set on 14 private acres.",
    description:
      "Where Claire & Daniel hosted their wedding without an agent in between. Linden Estate gives you the library, limestone loggia, sunken garden, and heated carriage barn for one transparent owner fee.",
    architecturalNotes:
      "14 private acres · Limestone loggia · Heated timber carriage barn",
    dimensions: "5,400 sq ft indoor + 2-acre manicured lawns",
    coverImage:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    ],
    packages: [
      {
        id: "pkg-linden-day",
        name: "Estate & Carriage Barn Buyout",
        description:
          "Full private run of the grounds, library, loggia, and reception barn.",
        price: 7200,
        priceType: "flat",
        maxGuests: 180,
        includedFeatures: [
          "12 hours private estate exclusivity",
          "Ceremony chairs on the sunken parterre + indoor rain plan",
          "Manor library & upstairs dressing rooms",
          "Open vendor policy with zero percentage surcharge",
        ],
      },
      {
        id: "pkg-linden-overnight",
        name: "Manor Weekend Residency",
        description:
          "Includes overnight accommodation for 14 in the main house + Sunday brunch lawn.",
        price: 9600,
        priceType: "flat",
        maxGuests: 180,
        includedFeatures: [
          "Friday 2:00 PM check-in through Sunday 12:00 PM",
          "7 en-suite manor bedrooms for immediate family",
          "Rehearsal dinner access in the Stone Cellar",
          "Direct coordination with Arthur & Maeve",
        ],
      },
    ],
    addOns: [
      {
        id: "add-linden-cellar",
        name: "Stone Cellar Late-Night Lounge",
        description: "Candlelit downstairs vault open until 1:30 AM.",
        price: 600,
      },
    ],
    availability: [
      { date: "2026-12-12", status: "blocked", note: "Wedding Reception" },
      { date: "2026-12-19", status: "blocked", note: "Winter Wedding" },
      { date: "2026-12-20", status: "available" },
      { date: "2026-12-27", status: "available" },
    ],
    galleryCaptions: [
      {
        title: "Limestone Loggia & Parterre",
        aspect: "4/5",
        note: "Sheltered colonnade overlooking the valley",
      },
      {
        title: "Timber Carriage Barn",
        aspect: "16/10",
        note: "Seats 180 under hand-hewn oak trusses",
      },
      {
        title: "The Manor Library",
        aspect: "16/10",
        note: "Wood-burning hearth for cocktail hour",
      },
    ],
  },
  {
    id: "venue-cedar-pavilion",
    slug: "cedar-pavilion",
    indexNumber: "06",
    name: "Cedar Pavilion",
    kind: "venue",
    area: "Lakeside",
    address: "502 West Shore Peninsula, Lakeside",
    maxGuests: 400,
    basePrice: 9800,
    priceUnitLabel: "$9,800",
    categories: ["Wedding", "Corporate"],
    availabilityLabel: "Open Dec 28",
    verified: true,
    verifiedDate: "Visited Nov 09, 2026",
    ownerName: "Kenji Takahashi",
    ownerRole: "Architect & Owner",
    ownerResponseTime: "Replies within 1 hour",
    shortSummary:
      "Cantilevered charred-cedar and glass pavilion projecting over the quiet western shore of the lake.",
    description:
      "Designed by Kenji Takahashi as a sanctuary for large-scale gatherings, Cedar Pavilion features 18-foot floor-to-ceiling low-iron glass walls on three sides, radiant slate floors, and a cantilevered pine deck.",
    architecturalNotes:
      "9,200 sq ft · 270-degree lake glass · Acoustic cedar slat ceiling",
    dimensions: "140 ft × 65 ft · 18 ft clear glass height",
    coverImage:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    ],
    packages: [
      {
        id: "pkg-cedar-pavilion",
        name: "Full Peninsula Buyout (12 hrs)",
        description:
          "Complete architectural pavilion and pine shore grounds up to 400 guests.",
        price: 9800,
        priceType: "flat",
        maxGuests: 400,
        includedFeatures: [
          "12 hours exclusive access to Pavilion & Lake Deck",
          "400 minimal Danish oak chairs & modular banquet tables",
          "Dual chef kitchens (hot line + pastry/plating room)",
          "Direct owner terms with zero broker commission",
        ],
      },
    ],
    addOns: [
      {
        id: "add-cedar-bonfire",
        name: "Shoreline Basalt Fire Pit",
        description: "Custom sunken basalt hearth tended all evening.",
        price: 480,
      },
    ],
    availability: [
      { date: "2026-12-19", status: "blocked", note: "Wedding Buyout" },
      { date: "2026-12-28", status: "available" },
      { date: "2026-12-29", status: "available" },
      { date: "2026-12-30", status: "available" },
    ],
    galleryCaptions: [
      {
        title: "Cantilevered Glass Hall",
        aspect: "4/5",
        note: "270-degree winter water panorama",
      },
      {
        title: "Charred Cedar Colonnade",
        aspect: "16/10",
        note: "Covered arrival walk in rain or snow",
      },
      {
        title: "West Shore Pine Deck",
        aspect: "16/10",
        note: "Direct steps to the water edge",
      },
    ],
  },
  // Vendors
  {
    id: "vendor-oak-and-ember",
    slug: "oak-and-ember",
    indexNumber: "07",
    name: "Oak & Ember",
    kind: "vendor",
    vendorSpecialty: "Catering",
    area: "Old Town",
    address: "214 Commissary Row, Old Town",
    maxGuests: 350,
    basePrice: 45,
    priceUnitLabel: "From $45 per guest",
    categories: ["Wedding", "Birthday", "Corporate"],
    availabilityLabel: "Available",
    verified: true,
    verifiedDate: "Visited Oct 22, 2026",
    ownerName: "Chef Julian Vance",
    ownerRole: "Chef-Owner",
    ownerResponseTime: "Replies within 2 hours",
    shortSummary:
      "Wood-fired seasonal menus cooked over live white oak, served family-style on stoneware without agency markups.",
    description:
      "Chef Julian Vance and his team bring mobile wood-fired hearths or work seamlessly out of venue kitchens. You pay the exact per-guest food and staffing cost directly to the kitchen.",
    architecturalNotes:
      "Self-contained mobile hearth · Full stoneware & linen service · Zero corkage",
    dimensions: "Serves 30 to 350 guests",
    coverImage:
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    ],
    packages: [
      {
        id: "pkg-oak-family",
        name: "Seasonal Family-Style Feast",
        description:
          "Three courses of wood-roasted meats, heirloom grains, and winter greens.",
        price: 45,
        priceType: "per_guest",
        maxGuests: 350,
        includedFeatures: [
          "3 passed hearth canapés during cocktail hour",
          "2 wood-fired proteins + 3 seasonal vegetable platters",
          "Handmade sourdough & cultured butter service",
          "Direct kitchen pricing — 0% catering broker fee",
        ],
      },
      {
        id: "pkg-oak-tasting",
        name: "Five-Course Plated Tasting & Bar Staff",
        description:
          "Full plated dinner service with dedicated sommelier and bartenders.",
        price: 78,
        priceType: "per_guest",
        maxGuests: 250,
        includedFeatures: [
          "5 plated courses with ceramic tableware rental included",
          "Full bar staffing & house-made botanical mixers",
          "Chef tasting for two prior to event",
        ],
      },
    ],
    addOns: [
      {
        id: "add-oak-rawbar",
        name: "East Coast Oyster & Crudo Station",
        description: "Shucked to order for 90-minute cocktail hour.",
        price: 950,
      },
    ],
    availability: [
      { date: "2026-12-08", status: "available" },
      { date: "2026-12-14", status: "booked", note: "Pending · Claire & Daniel" },
      { date: "2026-12-20", status: "available" },
      { date: "2026-12-28", status: "available" },
    ],
    galleryCaptions: [
      {
        title: "Live White-Oak Hearth",
        aspect: "4/5",
        note: "Slow-roasting heritage cuts on site",
      },
      {
        title: "Long Table Stoneware Service",
        aspect: "16/10",
        note: "Shared platters designed for conversation",
      },
    ],
  },
  {
    id: "vendor-northlight-studio",
    slug: "northlight-studio",
    indexNumber: "08",
    name: "Northlight Studio",
    kind: "vendor",
    vendorSpecialty: "Photography",
    area: "Downtown",
    address: "74 Crosby Loft 3A, Downtown",
    maxGuests: 400,
    basePrice: 1800,
    priceUnitLabel: "From $1,800",
    categories: ["Wedding", "Birthday", "Corporate"],
    availabilityLabel: "Available",
    verified: true,
    verifiedDate: "Visited Oct 30, 2026",
    ownerName: "Maren Lind",
    ownerRole: "Principal Photographer",
    ownerResponseTime: "Replies within 1 hour",
    shortSummary:
      "Documentary medium-format film and digital reportage with full archival hi-res ownership.",
    description:
      "Maren shoots unobtrusive, architectural documentary coverage on Leica digital and Kodak 120 film. Every frame is delivered in full resolution without watermarks or locked print-store markups.",
    architecturalNotes:
      "Digital + Medium Format 120 Film · 72-hour preview gallery · Full copyright release",
    dimensions: "6 to 12 hours continuous coverage",
    coverImage:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1400&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    ],
    packages: [
      {
        id: "pkg-north-8hr",
        name: "Documentary Coverage (8 hrs)",
        description:
          "Lead photographer Maren Lind with digital + 4 rolls of medium-format film.",
        price: 1800,
        priceType: "flat",
        maxGuests: 400,
        includedFeatures: [
          "8 hours continuous documentary reportage",
          "40 preview selects within 48 hours",
          "600+ edited high-resolution archival JPEGs",
          "Direct photographer contract — no studio agency cut",
        ],
      },
    ],
    addOns: [
      {
        id: "add-north-super8",
        name: "Super 8mm Motion Reel (4 min)",
        description: "Two cartridges of Kodak Super 8 scanned in 4K overscan.",
        price: 650,
      },
    ],
    availability: [
      { date: "2026-12-08", status: "available" },
      { date: "2026-12-12", status: "available" },
      { date: "2026-12-14", status: "available" },
      { date: "2026-12-28", status: "available" },
    ],
    galleryCaptions: [
      {
        title: "Medium Format Portra Study",
        aspect: "4/5",
        note: "Natural window light without flash intrusion",
      },
      {
        title: "Candlelit Dinner Reportage",
        aspect: "16/10",
        note: "Shot at Harbor Hall",
      },
    ],
  },
  {
    id: "vendor-fern-and-folk",
    slug: "fern-and-folk",
    indexNumber: "09",
    name: "Fern & Folk",
    kind: "vendor",
    vendorSpecialty: "Florals",
    area: "Riverside",
    address: "16 Botanical Way, Riverside",
    maxGuests: 400,
    basePrice: 900,
    priceUnitLabel: "From $900",
    categories: ["Wedding", "Birthday", "Corporate"],
    availabilityLabel: "Available",
    verified: true,
    verifiedDate: "Visited Nov 04, 2026",
    ownerName: "Soraia Mendez",
    ownerRole: "Floral Sculptor & Grower",
    ownerResponseTime: "Replies within 2 hours",
    shortSummary:
      "Foam-free architectural branches, winter hellebores, and sculptural table vessels grown locally.",
    description:
      "Fern & Folk sources branches and seasonal stems directly from regional growers and their own cutting beds. Zero floral-wire markups and complete transparency on vessel rentals.",
    architecturalNotes:
      "100% floral-foam free · Ceramic & stone vessels included · Compost collection",
    dimensions: "Intimate dinners to 400-guest installations",
    coverImage:
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1400&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=1200&q=80",
    ],
    packages: [
      {
        id: "pkg-fern-tables",
        name: "Architectural Table & Bar Styling",
        description:
          "Low Ikebana-inspired ceramic arrangements for up to 12 banquet tables + bar focal.",
        price: 900,
        priceType: "flat",
        maxGuests: 150,
        includedFeatures: [
          "12 hand-thrown stoneware table arrangements",
          "Statement welcome/bar branch installation",
          "Beeswax taper candles in brass holders",
        ],
      },
    ],
    addOns: [
      {
        id: "add-fern-hanging",
        name: "Suspended Branch Cloud (16 ft)",
        description: "Rigged above the head table using foraged winter beech.",
        price: 550,
      },
    ],
    availability: [
      { date: "2026-12-08", status: "available" },
      { date: "2026-12-12", status: "available" },
      { date: "2026-12-14", status: "available" },
      { date: "2026-12-28", status: "available" },
    ],
    galleryCaptions: [
      {
        title: "Foraged Branch & Hellebore Study",
        aspect: "4/5",
        note: "Zero floral foam, 100% reusable mechanics",
      },
      {
        title: "Beeswax & Ceramic Scape",
        aspect: "16/10",
        note: "Designed for long oak tables",
      },
    ],
  },
  {
    id: "vendor-static-sound-co",
    slug: "static-sound-co",
    indexNumber: "10",
    name: "Static Sound Co.",
    kind: "vendor",
    vendorSpecialty: "Sound",
    area: "Old Town",
    address: "33 Mercer Mews, Old Town",
    maxGuests: 400,
    basePrice: 600,
    priceUnitLabel: "From $600",
    categories: ["Wedding", "Birthday", "Corporate"],
    availabilityLabel: "Available",
    verified: true,
    verifiedDate: "Visited Nov 01, 2026",
    ownerName: "Devon Okafor",
    ownerRole: "Acoustic Engineer & Vinyl Selector",
    ownerResponseTime: "Replies within 1 hour",
    shortSummary:
      "Bespoke birch-cabinet hi-fi sound systems, wireless lapel mics, and all-vinyl or lossless DJ sets.",
    description:
      "Tired of plastic PA speakers ruining a beautiful room? Static Sound Co. deploys furniture-grade birch horn speakers and Shure Axient wireless microphones tuned specifically to reverberant loft and hall acoustics.",
    architecturalNotes:
      "Custom Baltic birch enclosures · Feedback-free speech clarity · Vinyl & digital",
    dimensions: "Rooms from 50 to 400 guests",
    coverImage:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    ],
    packages: [
      {
        id: "pkg-sound-pa",
        name: "Architectural Speech & Playback Rig",
        description:
          "Complete hi-fi speaker pair, 2 wireless mics, and engineer delivery/strike.",
        price: 600,
        priceType: "flat",
        maxGuests: 250,
        includedFeatures: [
          "Pair of custom birch coaxial loudspeakers on brass stands",
          "2 Shure wireless handheld/lapel microphones for toasts",
          "Lossless playlist interface + room EQ calibration",
        ],
      },
    ],
    addOns: [
      {
        id: "add-sound-ceremony",
        name: "Battery Satellite Rig for Courtyard",
        description:
          "Cable-free weatherproof speaker + lapel mic for outdoor vows.",
        price: 240,
      },
    ],
    availability: [
      { date: "2026-12-08", status: "available" },
      { date: "2026-12-12", status: "available" },
      { date: "2026-12-14", status: "available" },
      { date: "2026-12-28", status: "available" },
    ],
    galleryCaptions: [
      {
        title: "Baltic Birch Horn Console",
        aspect: "4/5",
        note: "Blends into architectural interiors",
      },
      {
        title: "Rotary Mixer & Vinyl Booth",
        aspect: "16/10",
        note: "Warm analog sound without harsh highs",
      },
    ],
  },
];

export const INITIAL_BOOKINGS: BookingRequest[] = [
  {
    id: "bk-seed-104",
    bookingCode: "MGE-2026-104",
    listingId: "venue-harbor-hall",
    listingSlug: "harbor-hall",
    listingName: "Harbor Hall",
    area: "Waterfront",
    plannerName: "Claire & Daniel Mercer",
    plannerEmail: "claire.mercer@example.com",
    plannerPhone: "+1 (212) 555-0194",
    eventCategory: "Wedding",
    eventDate: "2026-12-06",
    guestCount: 180,
    packageId: "pkg-harbor-classic",
    packageName: "Arch Hall & Pier Deck (10 hrs)",
    selectedAddOnIds: [],
    venueSubtotal: 4800,
    addOnsSubtotal: 0,
    brokerFee: 0,
    totalAmount: 4800,
    status: "Confirmed",
    dbStatus: "CONFIRMED",
    notes:
      "Confirmed directly with Clara Chen-strom. Water taxi arrival at 4:30 PM.",
    ownerResponseNote: "Pier 7 North slip reserved for your launch.",
    createdAt: "2026-11-10",
  },
  {
    id: "bk-seed-109",
    bookingCode: "MGE-2026-109",
    listingId: "vendor-oak-and-ember",
    listingSlug: "oak-and-ember",
    listingName: "Oak & Ember",
    area: "Old Town",
    plannerName: "Claire & Daniel Mercer",
    plannerEmail: "claire.mercer@example.com",
    plannerPhone: "+1 (212) 555-0194",
    eventCategory: "Wedding",
    eventDate: "2026-12-14",
    guestCount: 140,
    packageId: "pkg-oak-family",
    packageName: "Seasonal Family-Style Feast",
    selectedAddOnIds: [],
    venueSubtotal: 6300,
    addOnsSubtotal: 0,
    brokerFee: 0,
    totalAmount: 6300,
    status: "Pending Owner Reply",
    dbStatus: "PENDING",
    notes:
      "Menu tasting requested for late November; 12 vegetarian guests.",
    createdAt: "2026-11-12",
  },
];
