import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Listing not found." },
        { status: 404 }
      );
    }

    await prisma.listing.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/properties");
    revalidatePath("/dashboard/owner");
    revalidatePath("/admin");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete listing." },
      { status: 500 }
    );
  }
}
