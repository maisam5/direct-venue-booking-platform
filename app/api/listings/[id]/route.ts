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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireHost();
    const { id } = await context.params;

    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, ownerId: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existing.ownerId !== session.dbUserId && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: You can only edit your own listings" },
        { status: 403 }
      );
    }

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
    const contactEmail = (formData.get("contactEmail") as string)?.trim();
    const contactPhone = (formData.get("contactPhone") as string)?.trim();

    if (
      !title ||
      !description ||
      !priceRaw ||
      !locationValue ||
      !contactEmail ||
      !contactPhone
    ) {
      return NextResponse.json(
        { error: "Title, description, price, location, email & phone are required." },
        { status: 400 }
      );
    }

    const galleryImages: string[] = [];
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

    const uploadedFiles = formData.getAll("images") as File[];
    for (const file of uploadedFiles) {
      if (file instanceof File && file.size > 0) {
        const dataUrl = await fileToDataUrl(file);
        if (dataUrl) galleryImages.push(dataUrl);
      }
    }

    if (galleryImages.length < 3 || galleryImages.length > 5) {
      return NextResponse.json(
        { error: "Listings must have between 3 and 5 photos." },
        { status: 400 }
      );
    }

    const price = Math.max(10, Math.round(Number(priceRaw) || 1500));
    const matchedCat = categories.find((c) => c.slug === categorySlug);

    const { getByValue } = useCountries();
    const locationObj = getByValue(locationValue);
    const city = locationObj?.value || locationValue;
    const address =
      addressInput || locationObj?.defaultAddress || `${city} Verified District`;

    const eventTypes = eventTypesRaw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description,
        ...(matchedCat ? { category: matchedCat.prismaCategory } : {}),
        eventTypes:
          eventTypes.length > 0 ? eventTypes : ["WEDDING", "CORPORATE"],
        city,
        address,
        basePrice: price,
        maxCapacity: Math.max(10, guestCount),
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
      },
      include: {
        owner: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        packages: true,
        availability: {
          orderBy: { date: "asc" },
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/properties");
    revalidatePath(`/listings/${updated.slug}`);
    revalidatePath("/dashboard/owner");

    return NextResponse.json({
      success: true,
      listing: mapPrismaListingToUi(updated, 0),
    });
  } catch (error) {
    const status =
      error instanceof AuthError
        ? error.code === "UNAUTHENTICATED"
          ? 401
          : 403
        : 500;
    return NextResponse.json(
      { error: errorMessage(error, "Failed to update listing") },
      { status }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireHost();
    const { id } = await context.params;

    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, ownerId: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existing.ownerId !== session.dbUserId && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: You can only delete your own listings" },
        { status: 403 }
      );
    }

    await prisma.listing.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/properties");
    revalidatePath("/dashboard/owner");

    return NextResponse.json({ success: true });
  } catch (error) {
    const status =
      error instanceof AuthError
        ? error.code === "UNAUTHENTICATED"
          ? 401
          : 403
        : 500;
    return NextResponse.json(
      { error: errorMessage(error, "Failed to delete listing") },
      { status }
    );
  }
}
