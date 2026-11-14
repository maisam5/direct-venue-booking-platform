"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { syncDbUser } from "@/lib/auth";
import {
  AppRole,
  ROLE_LABELS,
  parseRole,
  parseSelfServeRole,
  resolveRoleChange,
} from "@/lib/roles";

export type OnboardingResult =
  | { ok: true; role: AppRole; changed: boolean; notice?: string }
  | { ok: false; error: string };

/**
 * Called right after sign-in / sign-up (and when a planner upgrades to a host).
 * Writes the role to Clerk `publicMetadata` (server-only, so users cannot grant
 * themselves roles from the browser) and syncs the database user row.
 */
export async function completeOnboardingAction(input: {
  role?: string | null;
}): Promise<OnboardingResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const current = parseRole(user.publicMetadata?.role);
    const requested = parseSelfServeRole(input.role) ?? "PLANNER";
    const next = resolveRoleChange(current, requested);
    const changed = next !== current;

    if (changed) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { ...user.publicMetadata, role: next },
      });
    }

    // `user` is a Clerk Backend user; currentUser() returns the same shape.
    await syncDbUser(user as Parameters<typeof syncDbUser>[0], next);

    const notice =
      requested !== "PLANNER" && next !== requested
        ? `Your account is already registered as a ${ROLE_LABELS[next].toLowerCase()}.`
        : undefined;

    return { ok: true, role: next, changed, notice };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "We couldn't finish setting up your account.",
    };
  }
}
