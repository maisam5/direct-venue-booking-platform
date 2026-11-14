import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function runSeed() {
  console.log("Seeding MG-Events PostgreSQL database...");

  // 1. Upsert Planner & Owner Users
  const planner = await prisma.user.upsert({
    where: { email: "claire.mercer@example.com" },
    update: {
      fullName: "Claire & Daniel Mercer",
      phone: "+1 (212) 555-0194",
      role: "PLANNER",
    },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      email: "claire.mercer@example.com",
      fullName: "Claire & Daniel Mercer",
      phone: "+1 (212) 555-0194",
      role: "PLANNER",
    },
  });

  const ownerClara = await prisma.user.upsert({
    where: { email: "clara@harborhall.local" },
    update: {
      fullName: "Clara Chen-strom",
      phone: "+1 (212) 555-0118",
      role: "OWNER",
    },
    create: {
      id: "00000000-0000-4000-8000-000000000002",
      email: "clara@harborhall.local",
      fullName: "Clara Chen-strom",
      phone: "+1 (212) 555-0118",
      role: "OWNER",
    },
  });

  const listingsSeed = [
    {
      slug: "atlas-loft",
      title: "Atlas Loft",
      description:
        "Originally a 1924 mapmaking bindery, Atlas Loft spans 2,800 square feet of column-free space in the heart of Downtown. You deal directly with the owner—no venue coordinators taking a 22% service cut.",
      category: "VENUE" as const,
      eventTypes: ["CORPORATE", "BIRTHDAY"],
      city: "Downtown",
      address: "412 Mercer Street, Penthouse B, Downtown",
      latitude: 40.7243,
      longitude: -73.9975,
      basePrice: 1500,
      pricingUnit: "PER_EVENT" as const,
      minCapacity: 20,
      maxCapacity: 90,
      isVerified: true,
      amenities: [
        "70 ft × 40 ft · 16 ft ceiling height",
        "2,800 sq ft North & West daylight exposure",
        "Dedicated freight elevator & induction scullery",
      ],
      coverImage: "mgevents/venues/atlas-loft-hero",
      galleryImages: [
        "mgevents/venues/atlas-loft-hero",
        "mgevents/venues/atlas-loft-scullery",
      ],
      packages: [
        {
          name: "Daylight Session (6 hrs)",
          description:
            "Ideal for offsites, press launches, and milestone afternoon gatherings.",
          price: 1500,
          includedItems: [
            "Exclusive loft access (9:00 AM – 3:00 PM)",
            "Custom modular oak tables & 90 architectural chairs",
            "10 Gbps fiber & 4K laser projection wall",
            "Direct owner key-handoff & post-event standard cleaning",
          ],
        },
        {
          name: "Full Evening Buyout (10 hrs)",
          description:
            "Complete private access through midnight with rooftop terrace entry.",
          price: 2200,
          includedItems: [
            "Exclusive loft + west terrace access (2:00 PM – 12:00 AM)",
            "Commercial scullery & induction prep kitchen",
            "Integrated house sound system",
            "BYO beverage policy with zero corkage fee",
          ],
        },
      ],
      openDates: ["2026-12-06", "2026-12-10", "2026-12-14", "2026-12-18"],
      blockedDates: ["2026-12-19"],
    },
    {
      slug: "marlowe-gardens",
      title: "Marlowe Gardens",
      description:
        "Heated year-round under wrought-iron glazing, Marlowe Gardens pairs a 19th-century botanical conservatory with a limestone courtyard overlooking the quiet bend of the river.",
      category: "VENUE" as const,
      eventTypes: ["BIRTHDAY", "WEDDING"],
      city: "Riverside",
      address: "88 Riverbend Conservatory Lane, Riverside",
      latitude: 40.7851,
      longitude: -73.9782,
      basePrice: 2400,
      pricingUnit: "PER_EVENT" as const,
      minCapacity: 30,
      maxCapacity: 120,
      isVerified: true,
      amenities: [
        "85 ft × 40 ft orangery + 4,000 sq ft courtyard",
        "Heated limestone floor under glass",
        "Private riverside lawn & gatehouse suite",
      ],
      coverImage: "mgevents/venues/marlowe-gardens-hero",
      galleryImages: ["mgevents/venues/marlowe-gardens-hero"],
      packages: [
        {
          name: "Conservatory Gathering (8 hrs)",
          description:
            "Ceremony and reception access across the glasshouse and river lawn.",
          price: 2400,
          includedItems: [
            "8 hours exclusive access to Orangery & Walled Courtyard",
            "Bentwood dining chairs & banquet tables for 120",
            "Private bridal/green suite in the Gatehouse",
            "Zero commission on external caterers or florists",
          ],
        },
        {
          name: "Full Day + Rehearsal Hour (12 hrs)",
          description:
            "Extended access from 11:00 AM to 11:00 PM plus prior-day walkthrough.",
          price: 3400,
          includedItems: [
            "12 hours full estate access",
            "Outdoor cedar fire bowls lit at dusk",
            "Climate-controlled wine storage room",
          ],
        },
      ],
      openDates: ["2026-12-08", "2026-12-14", "2026-12-16", "2026-12-22"],
      blockedDates: ["2026-12-19"],
    },
    {
      slug: "the-foundry",
      title: "The Foundry",
      description:
        "Built for heavy cast-iron fabrication in 1908, The Foundry offers 6,200 square feet of raw architectural volume softened by Danish acoustic oak paneling.",
      category: "VENUE" as const,
      eventTypes: ["CORPORATE", "BIRTHDAY"],
      city: "Old Town",
      address: "19 Ironworks Alley, Old Town",
      latitude: 40.7033,
      longitude: -73.9881,
      basePrice: 3600,
      pricingUnit: "PER_EVENT" as const,
      minCapacity: 50,
      maxCapacity: 250,
      isVerified: true,
      amenities: [
        "110 ft × 56 ft + Mezzanine · 28 ft steel truss roof",
        "Street-level vehicle roll-up door",
        "3-phase 200A production power drop",
      ],
      coverImage: "mgevents/venues/the-foundry-hero",
      galleryImages: ["mgevents/venues/the-foundry-hero"],
      packages: [
        {
          name: "Main Crane Hall (10 hrs)",
          description:
            "Full floor and mezzanine access for conferences, galas, or milestone nights.",
          price: 3600,
          includedItems: [
            "10 hours private access including load-in",
            "3-phase 200A production power drop included",
            "Mezzanine espresso & cocktail bar fixture",
            "Zero markup on AV or catering vendors",
          ],
        },
        {
          name: "24-Hour Production Hold",
          description:
            "Full day-to-day lock for elaborate staging or corporate town halls.",
          price: 4900,
          includedItems: [
            "24-hour key lock from 8:00 AM",
            "Scissor-lift access for truss rigging",
            "Green rooms A & B + private shower suites",
          ],
        },
      ],
      openDates: ["2026-12-12", "2026-12-13", "2026-12-14", "2026-12-21"],
      blockedDates: ["2026-12-05"],
    },
    {
      slug: "harbor-hall",
      title: "Harbor Hall",
      description:
        "Featured on our cover, Harbor Hall sits directly over the North Basin pilings. Three 22-foot masonry arches frame passing sailboats and evening water reflections.",
      category: "VENUE" as const,
      eventTypes: ["WEDDING", "CORPORATE"],
      city: "Waterfront",
      address: "Pier 7 North Basin, Waterfront",
      latitude: 40.7081,
      longitude: -74.0145,
      basePrice: 4800,
      pricingUnit: "PER_EVENT" as const,
      minCapacity: 60,
      maxCapacity: 300,
      isVerified: true,
      amenities: [
        "125 ft × 60 ft · 24 ft vaulted ceiling",
        "7,500 sq ft · Triple masonry arches",
        "120-foot over-water cedar promenade",
      ],
      coverImage: "mgevents/venues/harbor-hall-hero",
      galleryImages: [
        "mgevents/venues/harbor-hall-hero",
        "mgevents/venues/harbor-hall-promenade",
      ],
      packages: [
        {
          name: "Arch Hall & Pier Deck (10 hrs)",
          description:
            "Complete waterfront buyout for weddings and keynote dinners up to 300 guests.",
          price: 4800,
          includedItems: [
            "Exclusive use of Main Arch Hall & Over-Water Promenade",
            "300 solid ash dining chairs & 36 banquet tables",
            "Full commercial catering kitchen with separate service corridor",
            "Direct owner contract — $0 agency or platform fee",
          ],
        },
        {
          name: "Harbor Grand Weekend (14 hrs)",
          description:
            "Morning-to-midnight access plus private water-taxi landing slip.",
          price: 6200,
          includedItems: [
            "14 hours exclusive pier access (10:00 AM – 12:00 AM)",
            "Private mooring slip for guest charter boat arrival",
            "Two harbor-facing dressing salons",
          ],
        },
      ],
      openDates: ["2026-12-14", "2026-12-15", "2026-12-18", "2026-12-20"],
      blockedDates: ["2026-12-12"],
    },
    {
      slug: "linden-estate",
      title: "Linden Estate",
      description:
        "Where Claire & Daniel hosted their wedding without an agent in between. Linden Estate gives you the library, limestone loggia, sunken garden, and heated carriage barn for one transparent owner fee.",
      category: "VENUE" as const,
      eventTypes: ["WEDDING", "BIRTHDAY"],
      city: "North Hills",
      address: "1400 Linden Ridge Road, North Hills",
      latitude: 40.8124,
      longitude: -73.9412,
      basePrice: 7200,
      pricingUnit: "PER_EVENT" as const,
      minCapacity: 40,
      maxCapacity: 180,
      isVerified: true,
      amenities: [
        "5,400 sq ft indoor + 2-acre manicured lawns",
        "14 private acres · Limestone loggia",
        "Heated timber carriage barn",
      ],
      coverImage: "mgevents/venues/linden-estate-hero",
      galleryImages: ["mgevents/venues/linden-estate-hero"],
      packages: [
        {
          name: "Estate & Carriage Barn Buyout",
          description:
            "Full private run of the grounds, library, loggia, and reception barn.",
          price: 7200,
          includedItems: [
            "12 hours private estate exclusivity",
            "Ceremony chairs on the sunken parterre + indoor rain plan",
            "Manor library & upstairs dressing rooms",
            "Open vendor policy with zero percentage surcharge",
          ],
        },
        {
          name: "Manor Weekend Residency",
          description:
            "Includes overnight accommodation for 14 in the main house + Sunday brunch lawn.",
          price: 9600,
          includedItems: [
            "Friday 2:00 PM check-in through Sunday 12:00 PM",
            "7 en-suite manor bedrooms for immediate family",
            "Rehearsal dinner access in the Stone Cellar",
          ],
        },
      ],
      openDates: ["2026-12-20", "2026-12-27"],
      blockedDates: ["2026-12-12", "2026-12-19"],
    },
    {
      slug: "cedar-pavilion",
      title: "Cedar Pavilion",
      description:
        "Cantilevered charred-cedar and glass pavilion projecting over the quiet western shore of the lake with 18-foot floor-to-ceiling low-iron glass walls.",
      category: "VENUE" as const,
      eventTypes: ["WEDDING", "CORPORATE"],
      city: "Lakeside",
      address: "502 West Shore Peninsula, Lakeside",
      latitude: 40.8511,
      longitude: -73.9201,
      basePrice: 9800,
      pricingUnit: "PER_EVENT" as const,
      minCapacity: 80,
      maxCapacity: 400,
      isVerified: true,
      amenities: [
        "140 ft × 65 ft · 18 ft clear glass height",
        "9,200 sq ft · 270-degree lake glass",
        "Acoustic cedar slat ceiling & dual chef kitchens",
      ],
      coverImage: "mgevents/venues/cedar-pavilion-hero",
      galleryImages: ["mgevents/venues/cedar-pavilion-hero"],
      packages: [
        {
          name: "Full Peninsula Buyout (12 hrs)",
          description:
            "Complete architectural pavilion and pine shore grounds up to 400 guests.",
          price: 9800,
          includedItems: [
            "12 hours exclusive access to Pavilion & Lake Deck",
            "400 minimal Danish oak chairs & modular banquet tables",
            "Dual chef kitchens (hot line + pastry/plating room)",
            "Direct owner terms with zero broker commission",
          ],
        },
      ],
      openDates: ["2026-12-28", "2026-12-29", "2026-12-30"],
      blockedDates: ["2026-12-19"],
    },
    // Vendors
    {
      slug: "oak-and-ember",
      title: "Oak & Ember",
      description:
        "Wood-fired seasonal menus cooked over live white oak, served family-style on stoneware without agency markups. Pay the exact per-guest food and staffing cost directly to the kitchen.",
      category: "CATERING" as const,
      eventTypes: ["WEDDING", "BIRTHDAY", "CORPORATE"],
      city: "Old Town",
      address: "214 Commissary Row, Old Town",
      latitude: 40.7112,
      longitude: -73.9912,
      basePrice: 45,
      pricingUnit: "PER_HEAD" as const,
      minCapacity: 30,
      maxCapacity: 350,
      isVerified: true,
      amenities: [
        "Serves 30 to 350 guests",
        "Self-contained mobile hearth",
        "Full stoneware & linen service · Zero corkage",
      ],
      coverImage: "mgevents/vendors/oak-and-ember",
      galleryImages: ["mgevents/vendors/oak-and-ember"],
      packages: [
        {
          name: "Seasonal Family-Style Feast",
          description:
            "Three courses of wood-roasted meats, heirloom grains, and winter greens.",
          price: 45,
          includedItems: [
            "3 passed hearth canapés during cocktail hour",
            "2 wood-fired proteins + 3 seasonal vegetable platters",
            "Handmade sourdough & cultured butter service",
            "Direct kitchen pricing — 0% catering broker fee",
          ],
        },
        {
          name: "Five-Course Plated Tasting & Bar Staff",
          description:
            "Full plated dinner service with dedicated sommelier and bartenders.",
          price: 78,
          includedItems: [
            "5 plated courses with ceramic tableware rental included",
            "Full bar staffing & house-made botanical mixers",
            "Chef tasting for two prior to event",
          ],
        },
      ],
      openDates: ["2026-12-08", "2026-12-14", "2026-12-20", "2026-12-28"],
      blockedDates: [],
    },
    {
      slug: "northlight-studio",
      title: "Northlight Studio",
      description:
        "Documentary medium-format film and digital reportage with full archival hi-res ownership. Every frame is delivered without watermarks or locked print-store markups.",
      category: "PHOTOGRAPHY" as const,
      eventTypes: ["WEDDING", "BIRTHDAY", "CORPORATE"],
      city: "Downtown",
      address: "74 Crosby Loft 3A, Downtown",
      latitude: 40.7221,
      longitude: -73.9984,
      basePrice: 1800,
      pricingUnit: "PER_EVENT" as const,
      minCapacity: 10,
      maxCapacity: 400,
      isVerified: true,
      amenities: [
        "6 to 12 hours continuous coverage",
        "Digital + Medium Format 120 Film",
        "72-hour preview gallery · Full copyright release",
      ],
      coverImage: "mgevents/vendors/northlight-studio",
      galleryImages: ["mgevents/vendors/northlight-studio"],
      packages: [
        {
          name: "Documentary Coverage (8 hrs)",
          description:
            "Lead photographer with digital + 4 rolls of medium-format film.",
          price: 1800,
          includedItems: [
            "8 hours continuous documentary reportage",
            "40 preview selects within 48 hours",
            "600+ edited high-resolution archival JPEGs",
            "Direct photographer contract — no studio agency cut",
          ],
        },
      ],
      openDates: ["2026-12-08", "2026-12-12", "2026-12-14", "2026-12-28"],
      blockedDates: [],
    },
    {
      slug: "fern-and-folk",
      title: "Fern & Folk",
      description:
        "Foam-free architectural branches, winter hellebores, and sculptural table vessels grown locally with zero floral-wire markups.",
      category: "DECOR" as const,
      eventTypes: ["WEDDING", "BIRTHDAY", "CORPORATE"],
      city: "Riverside",
      address: "16 Botanical Way, Riverside",
      latitude: 40.7811,
      longitude: -73.9799,
      basePrice: 900,
      pricingUnit: "PER_EVENT" as const,
      minCapacity: 15,
      maxCapacity: 400,
      isVerified: true,
      amenities: [
        "Intimate dinners to 400-guest installations",
        "100% floral-foam free",
        "Ceramic & stone vessels included",
      ],
      coverImage: "mgevents/vendors/fern-and-folk",
      galleryImages: ["mgevents/vendors/fern-and-folk"],
      packages: [
        {
          name: "Architectural Table & Bar Styling",
          description:
            "Low Ikebana-inspired ceramic arrangements for up to 12 banquet tables + bar focal.",
          price: 900,
          includedItems: [
            "12 hand-thrown stoneware table arrangements",
            "Statement welcome/bar branch installation",
            "Beeswax taper candles in brass holders",
          ],
        },
      ],
      openDates: ["2026-12-08", "2026-12-12", "2026-12-14", "2026-12-28"],
      blockedDates: [],
    },
    {
      slug: "static-sound-co",
      title: "Static Sound Co.",
      description:
        "Bespoke birch-cabinet hi-fi sound systems, wireless lapel mics, and all-vinyl or lossless DJ sets tuned specifically to reverberant loft and hall acoustics.",
      category: "ENTERTAINMENT" as const,
      eventTypes: ["WEDDING", "BIRTHDAY", "CORPORATE"],
      city: "Old Town",
      address: "33 Mercer Mews, Old Town",
      latitude: 40.7155,
      longitude: -73.9942,
      basePrice: 600,
      pricingUnit: "PER_EVENT" as const,
      minCapacity: 25,
      maxCapacity: 400,
      isVerified: true,
      amenities: [
        "Rooms from 50 to 400 guests",
        "Custom Baltic birch enclosures",
        "Feedback-free speech clarity · Vinyl & digital",
      ],
      coverImage: "mgevents/vendors/static-sound-co",
      galleryImages: ["mgevents/vendors/static-sound-co"],
      packages: [
        {
          name: "Architectural Speech & Playback Rig",
          description:
            "Complete hi-fi speaker pair, 2 wireless mics, and engineer delivery/strike.",
          price: 600,
          includedItems: [
            "Pair of custom birch coaxial loudspeakers on brass stands",
            "2 Shure wireless handheld/lapel microphones for toasts",
            "Lossless playlist interface + room EQ calibration",
          ],
        },
      ],
      openDates: ["2026-12-08", "2026-12-12", "2026-12-14", "2026-12-28"],
      blockedDates: [],
    },
  ];

  for (const item of listingsSeed) {
    const listing = await prisma.listing.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        category: item.category,
        eventTypes: item.eventTypes,
        city: item.city,
        address: item.address,
        latitude: item.latitude,
        longitude: item.longitude,
        basePrice: item.basePrice,
        pricingUnit: item.pricingUnit,
        minCapacity: item.minCapacity,
        maxCapacity: item.maxCapacity,
        isVerified: item.isVerified,
        amenities: item.amenities,
        coverImage: item.coverImage,
        galleryImages: item.galleryImages,
      },
      create: {
        ownerId: ownerClara.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        category: item.category,
        eventTypes: item.eventTypes,
        city: item.city,
        address: item.address,
        latitude: item.latitude,
        longitude: item.longitude,
        basePrice: item.basePrice,
        pricingUnit: item.pricingUnit,
        minCapacity: item.minCapacity,
        maxCapacity: item.maxCapacity,
        isVerified: item.isVerified,
        amenities: item.amenities,
        coverImage: item.coverImage,
        galleryImages: item.galleryImages,
      },
    });

    // Replace packages idempotently if none exist yet
    const existingPkgs = await prisma.listingPackage.count({
      where: { listingId: listing.id },
    });
    if (existingPkgs === 0) {
      for (const pkg of item.packages) {
        await prisma.listingPackage.create({
          data: {
            listingId: listing.id,
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            includedItems: pkg.includedItems,
          },
        });
      }
    }

    // Upsert availability slots
    for (const dateStr of item.openDates) {
      const dateObj = new Date(`${dateStr}T00:00:00.000Z`);
      await prisma.availabilitySlot.upsert({
        where: {
          listingId_date: {
            listingId: listing.id,
            date: dateObj,
          },
        },
        update: {},
        create: {
          listingId: listing.id,
          date: dateObj,
          status: "AVAILABLE",
        },
      });
    }

    for (const dateStr of item.blockedDates) {
      const dateObj = new Date(`${dateStr}T00:00:00.000Z`);
      await prisma.availabilitySlot.upsert({
        where: {
          listingId_date: {
            listingId: listing.id,
            date: dateObj,
          },
        },
        update: {},
        create: {
          listingId: listing.id,
          date: dateObj,
          status: "BLOCKED",
          note: "Owner Hold",
        },
      });
    }
  }

  // Seed 2 realistic Bookings if not already present
  const harborHall = await prisma.listing.findUnique({
    where: { slug: "harbor-hall" },
    include: { packages: true },
  });

  if (harborHall) {
    const bookedDate = new Date("2026-12-06T00:00:00.000Z");
    const existingBooking = await prisma.booking.findUnique({
      where: { bookingCode: "MGE-2026-104" },
    });

    if (!existingBooking) {
      const createdBooking = await prisma.booking.create({
        data: {
          bookingCode: "MGE-2026-104",
          listingId: harborHall.id,
          plannerId: planner.id,
          packageId: harborHall.packages[0]?.id ?? null,
          eventDate: bookedDate,
          eventType: "WEDDING",
          guestCount: 180,
          totalAmount: 4800,
          status: "CONFIRMED",
          plannerNotes:
            "Confirmed directly with Clara Chen-strom. Water taxi arrival at 4:30 PM.",
          ownerResponseNote: "Pier 7 North slip reserved for your launch.",
        },
      });

      await prisma.availabilitySlot.upsert({
        where: {
          listingId_date: {
            listingId: harborHall.id,
            date: bookedDate,
          },
        },
        update: {
          status: "BOOKED",
          bookingId: createdBooking.id,
          note: "Claire & Daniel Wedding",
        },
        create: {
          listingId: harborHall.id,
          date: bookedDate,
          status: "BOOKED",
          bookingId: createdBooking.id,
          note: "Claire & Daniel Wedding",
        },
      });

      await prisma.review.upsert({
        where: { bookingId: createdBooking.id },
        update: {},
        create: {
          listingId: harborHall.id,
          plannerId: planner.id,
          bookingId: createdBooking.id,
          rating: 5,
          comment:
            "We saved thousands because there was no agent in between. The owner replied the same day.",
        },
      });
    }
  }

  const oakAndEmber = await prisma.listing.findUnique({
    where: { slug: "oak-and-ember" },
    include: { packages: true },
  });

  if (oakAndEmber) {
    const cateringDate = new Date("2026-12-14T00:00:00.000Z");
    const existingCateringBk = await prisma.booking.findUnique({
      where: { bookingCode: "MGE-2026-109" },
    });

    if (!existingCateringBk) {
      const createdCatering = await prisma.booking.create({
        data: {
          bookingCode: "MGE-2026-109",
          listingId: oakAndEmber.id,
          plannerId: planner.id,
          packageId: oakAndEmber.packages[0]?.id ?? null,
          eventDate: cateringDate,
          eventType: "WEDDING",
          guestCount: 140,
          totalAmount: 6300,
          status: "PENDING",
          plannerNotes:
            "Menu tasting requested for late November; 12 vegetarian guests.",
        },
      });

      await prisma.availabilitySlot.upsert({
        where: {
          listingId_date: {
            listingId: oakAndEmber.id,
            date: cateringDate,
          },
        },
        update: {
          status: "BOOKED",
          bookingId: createdCatering.id,
          note: "Pending · Claire & Daniel",
        },
        create: {
          listingId: oakAndEmber.id,
          date: cateringDate,
          status: "BOOKED",
          bookingId: createdCatering.id,
          note: "Pending · Claire & Daniel",
        },
      });
    }
  }

  console.log("Database seed completed successfully.");
}

if (require.main === module) {
  runSeed()
    .catch((e) => {
      console.error("Seed error:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
