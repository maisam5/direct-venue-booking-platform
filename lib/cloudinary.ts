import { v2 as cloudinary } from "cloudinary";

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  "dh6d3sb8r";

if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary, cloudName };

/**
 * Generates an optimized Cloudinary delivery URL with automatic format & quality (`f_auto,q_auto`).
 * Works seamlessly whether passed a Cloudinary publicId or a full URL.
 */
export function getCloudinaryUrl(
  publicIdOrUrl: string,
  variant: "thumbnail" | "hero" | "auto" = "auto"
): string {
  if (!publicIdOrUrl) return "";

  const transformMap = {
    thumbnail: "f_auto,q_auto,w_600,h_400,c_fill",
    hero: "f_auto,q_auto,w_1400,c_limit",
    auto: "f_auto,q_auto",
  };

  const transformation = transformMap[variant];

  if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
    if (publicIdOrUrl.includes("/upload/")) {
      return publicIdOrUrl.replace("/upload/", `/upload/${transformation}/`);
    }
    return publicIdOrUrl;
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicIdOrUrl}`;
}

export function generateUploadSignature(paramsToSign: Record<string, string | number>) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    throw new Error("CLOUDINARY_API_SECRET is not configured on the server");
  }
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
  return {
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    cloudName,
  };
}
