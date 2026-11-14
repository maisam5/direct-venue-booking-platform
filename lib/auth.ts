import "server-only";

import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { AppRole, isHostRole, parseRole, toDbRole } from "@/lib/roles";

export interface SessionUser {
  /** Clerk user id */
  clerkId: string;
  /** Primary key of the matching row in our `User` table */
  dbUserId: string;
  email: string;
  fullName: string;
  phone: string | null;
  imageUrl: string | null;
  role: AppRole;
  /** False until the user finished onboarding (role chosen). */
  hasRole: boolean;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: "UNAUTHENTICATED" | "FORBIDDEN"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

function primaryEmailOf(user: ClerkUser): string | null {
  const primary =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0];
  return primary?.emailAddress?.toLowerCase() ?? null;
}

function fullNameOf(user: ClerkUser, email: string): string {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username ||
    email.split("@")[0]
  );
}

/**
 * Ensures a `User` row exists for the Clerk user and that its role is in sync.
 * Rows are matched by email so that existing records (e.g. seeded data or
 * earlier bookings) are reused instead of duplicated.
 */
export async function syncDbUser(user: ClerkUser, role: AppRole) {
  const email = primaryEmailOf(user);
  if (!email) {
    throw new AuthError("Your account has no email address.", "FORBIDDEN");
  }
  const fullName = fullNameOf(user, email);
  const dbRole = toDbRole(role);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    return prisma.user.create({
      data: {
        id: user.id,
        email,
        fullName,
        role: dbRole,
        avatarUrl: user.imageUrl || null,
        phone: user.phoneNumbers[0]?.phoneNumber ?? null,
      },
    });
  }

  if (existing.role !== dbRole || (!existing.avatarUrl && user.imageUrl)) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { role: dbRole, avatarUrl: existing.avatarUrl || user.imageUrl || null },
    });
  }
  return existing;
}

/** Resolves the signed-in user once per request. Returns null when signed out. */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const user = await currentUser();
  if (!user) return null;

  const storedRole = parseRole(user.publicMetadata?.role);
  const role: AppRole = storedRole ?? "PLANNER";
  const dbUser = await syncDbUser(user, role);

  return {
    clerkId: user.id,
    dbUserId: dbUser.id,
    email: dbUser.email,
    fullName: dbUser.fullName,
    phone: dbUser.phone,
    imageUrl: user.imageUrl || null,
    role,
    hasRole: storedRole !== null,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new AuthError("Please sign in to continue.", "UNAUTHENTICATED");
  }
  return session;
}

export async function requireHost(): Promise<SessionUser> {
  const session = await requireUser();
  if (!isHostRole(session.role)) {
    throw new AuthError(
      "Only venue owners and vendors can do this. Register as a host first.",
      "FORBIDDEN"
    );
  }
  return session;
}

export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof AuthError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
