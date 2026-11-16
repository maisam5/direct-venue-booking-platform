import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { categories, buildListingAmenities } from "@/constants/Categories";
import useCountries from "@/custom-hooks/useCountries";
import { AuthError, requireHost, errorMessage } from "@/lib/auth";
import { mapPrismaListingToUi } from "@/lib/format";

async function fileToDataUrl(file: File): Promise<string | null> {
  if (!file || file.size === 0 || file.size > 15 * 1024 * 1024) return null;
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = file.type || "image/jpeg";
  return `data:${mimeType};base64,${base64}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireHost();
    const formData = await request.formData();

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const priceRaw = formData.get("price") as string;
    const locationValue = (formData.get("locationValue") as string)?.trim();
    const addressInput = (formData.get("address") as string)?.trim();
    const categorySlug = (formData.get("category") as string)?.trim();
    const roomCount = Number(formData.get("roomCount") || 1);
    const bathroomCount = Number(formData.get("bathroomCount") || 1);
    const guestCount = Number(formData.get("guestCount") || 50);
    const eventTypesRaw =
      (formData.get("eventTypes") as string) || "WEDDING,CORPORATE";
    const serviceOptionsRaw = formData.get("serviceOptions") as string | null;
    let serviceOptions: string[] = [];
    if (serviceOptionsRaw) {
      try {
        const parsed = JSON.parse(serviceOptionsRaw);
        if (Array.isArray(parsed)) {
          serviceOptions = parsed.filter(
            (item): item is string => typeof item === "string" && item.trim().length > 0
          );
        }
      } catch {
        // ignore invalid json
      }
    }
    const ownerNameInput = (formData.get("ownerName") as string)?.trim();
    const contactEmail = (formData.get("contactEmail") as string)?.trim();
    const contactPhone = (formData.get("contactPhone") as string)?.trim();

    if (
      !title ||
      !description ||
      !priceRaw ||
      !locationValue ||
      !categorySlug ||
      !contactEmail ||
      !contactPhone
    ) {
      return NextResponse.json(
        {
          error:
            "All fields including contact email and phone number are required!",
        },
        { status: 400 }
      );
    }

    // Collect gallery images (3 to 5 required)
    const galleryImages: string[] = [];
    const uploadedFiles = formData.getAll("images") as File[];
    for (const file of uploadedFiles) {
      if (file instanceof File && file.size > 0) {
        const dataUrl = await fileToDataUrl(file);
        if (dataUrl) galleryImages.push(dataUrl);
      }
    }

    const imageUrlsRaw = formData.get("imageUrls") as string | null;
    if (imageUrlsRaw) {
      try {
        const parsed = JSON.parse(imageUrlsRaw);
        if (Array.isArray(parsed)) {
          for (const url of parsed) {
            if (typeof url === "string" && url.trim()) {
              galleryImages.push(url.trim());
            }
          }
        }
      } catch {
        // ignore invalid json
      }
    }

    if (galleryImages.length < 3) {
      return NextResponse.json(
        { error: "At least 3 photos are required to publish a listing." },
        { status: 400 }
      );
    }

    if (galleryImages.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 photos are allowed per listing." },
        { status: 400 }
      );
    }

    const price = Math.max(10, Math.round(Number(priceRaw) || 1500));
    const matchedCat = categories.find((c) => c.slug === categorySlug);
    const prismaCategory = matchedCat?.prismaCategory ?? "VENUE";

    const { getByValue } = useCountries();
    const locationObj = getByValue(locationValue);
    const city = locationObj?.value || locationValue;
    const address =
      addressInput ||
      locationObj?.defaultAddress ||
      `${city} Verified District`;

    const ownerRecord = await prisma.user.update({
      where: { id: session.dbUserId },
      data: {
        fullName: ownerNameInput || session.fullName,
        phone: contactPhone,
      },
    });

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingSlug = await prisma.listing.findUnique({
      where: { slug: baseSlug },
    });
    const slug = existingSlug
      ? `${baseSlug}-${Math.floor(100 + Math.random() * 899)}`
      : baseSlug;

    const eventTypes = eventTypesRaw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const created = await prisma.listing.create({
      data: {
        ownerId: ownerRecord.id,
        slug,
        title,
        description,
        category: prismaCategory,
        eventTypes:
          eventTypes.length > 0 ? eventTypes : ["WEDDING", "CORPORATE"],
        city,
        address,
        latitude: locationObj?.latlng[0] ?? 40.7081,
        longitude: locationObj?.latlng[1] ?? -74.0018,
        basePrice: price,
        pricingUnit: "PER_EVENT",
        minCapacity: Math.min(10, guestCount),
        maxCapacity: Math.max(10, guestCount),
        isVerified: true,
        amenities: buildListingAmenities({
          category: matchedCat,
          roomCount,
          bathroomCount,
          serviceOptions,
        }),
        coverImage: galleryImages[0],
        galleryImages,
        contactEmail,
        contactPhone,
        packages: {
          create: [
            {
              name:
                matchedCat?.kind === "vendor"
                  ? "Direct Full-Service Package"
                  : "Direct Full-Day Buyout (10 hrs)",
              description,
              price,
              includedItems:
                matchedCat?.kind === "vendor"
                  ? [
                      ...(serviceOptions.length > 0
                        ? serviceOptions.slice(0, 3)
                        : [`${matchedCat.label} Full Service`]),
                      "Direct vendor agreement with $0 broker markup",
                    ]
                  : [
                      `Capacity up to ${guestCount} guests`,
                      `${roomCount} rooms/spaces · ${bathroomCount} restrooms`,
                      "Direct owner agreement with $0 broker markup",
                    ],
            },
          ],
        },
        availability: {
          create: [
            {
              date: new Date("2026-12-14T00:00:00.000Z"),
              status: "AVAILABLE",
            },
            {
              date: new Date("2026-12-18T00:00:00.000Z"),
              status: "AVAILABLE",
            },
            {
              date: new Date("2026-12-22T00:00:00.000Z"),
              status: "AVAILABLE",
            },
          ],
        },
      },
      include: {
        owner: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        packages: true,
        availability: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/dashboard/owner");
    revalidatePath("/properties");

    return NextResponse.json({
      success: true,
      listing: mapPrismaListingToUi(created, 0),
    });
  } catch (error) {
    const status =
      error instanceof AuthError
        ? error.code === "UNAUTHENTICATED"
          ? 401
          : 403
        : 500;
    return NextResponse.json(
      {
        error: errorMessage(error, "Failed to create listing"),
      },
      { status }
    );
  }
}
