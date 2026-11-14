import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminEmail, isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [{ role: "OWNER" }, { listings: { some: {} } }],
    },
    include: {
      listings: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          city: true,
          basePrice: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: { bookings: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const owners = users.map((u) => {
    const hasVenue = u.listings.some((l) => l.category === "VENUE");
    const hasVendor = u.listings.some((l) => l.category !== "VENUE");
    const ownerType =
      hasVenue && hasVendor
        ? "Venue & Vendor"
        : hasVendor
        ? "Vendor"
        : "Venue Owner";

    return {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      ownerType,
      createdAt: u.createdAt.toISOString(),
      listings: u.listings.map((l) => ({
        id: l.id,
        slug: l.slug,
        title: l.title,
        category: l.category,
        kind: l.category === "VENUE" ? "venue" : "vendor",
        city: l.city,
        basePrice: l.basePrice,
        isVerified: l.isVerified,
        bookingsCount: l._count.bookings,
        createdAt: l.createdAt.toISOString(),
      })),
    };
  });

  return NextResponse.json({
    adminEmail: getAdminEmail(),
    owners,
  });
}
