import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireHost, errorMessage } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

const signRequestSchema = z.object({
  folder: z.string().default("mgevents/listings"),
  timestamp: z.number().int().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireHost();

    const body = await request.json().catch(() => ({}));
    const parsed = signRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid signature request payload" },
        { status: 400 }
      );
    }

    const timestamp =
      parsed.data.timestamp ?? Math.round(new Date().getTime() / 1000);
    const folder = parsed.data.folder;

    const signed = generateUploadSignature({
      folder,
      timestamp,
    });

    return NextResponse.json({
      signature: signed.signature,
      timestamp,
      folder,
      cloudName: signed.cloudName,
      apiKey: signed.apiKey,
    });
  } catch (err) {
    const status =
      err instanceof AuthError
        ? err.code === "UNAUTHENTICATED"
          ? 401
          : 403
        : 500;
    return NextResponse.json(
      {
        error: errorMessage(err, "Failed to generate Cloudinary signature"),
      },
      { status }
    );
  }
}
