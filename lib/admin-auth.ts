import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "mgevents_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getAdminConfig() {
  const email = (process.env.ADMIN_GMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    crypto
      .createHash("sha256")
      .update(`${email}:${password}:mgevents-admin-session`)
      .digest("hex");

  return { email, password, secret };
}

function safeEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function verifyAdminCredentials(
  emailInput: string,
  passwordInput: string
): boolean {
  const { email, password } = getAdminConfig();
  if (!email || !password) return false;
  return (
    safeEqual(emailInput.trim().toLowerCase(), email) &&
    safeEqual(passwordInput, password)
  );
}

export function createAdminSessionToken(email: string): string {
  const { secret } = getAdminConfig();
  const payload = Buffer.from(
    JSON.stringify({
      email: email.trim().toLowerCase(),
      exp: Date.now() + SESSION_TTL_MS,
    })
  ).toString("base64url");

  const sig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, sig] = parts;
  const { email, secret } = getAdminConfig();
  if (!email) return false;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  if (!safeEqual(sig, expectedSig)) return false;

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { email?: string; exp?: number };

    if (!decoded.email || !decoded.exp) return false;
    if (decoded.exp < Date.now()) return false;
    return safeEqual(decoded.email.toLowerCase(), email);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export function getAdminEmail(): string {
  return getAdminConfig().email;
}
