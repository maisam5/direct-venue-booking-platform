/**
 * Role model shared by client and server.
 *
 * The source of truth is Clerk `publicMetadata.role`, which can only be written
 * from the server (see `actions/auth.actions.ts`). The database `UserRole` enum
 * has no VENDOR value, so vendors are persisted as `OWNER` rows — both are
 * "hosts" that own listings; the venue/vendor split lives in Clerk.
 */
export const APP_ROLES = ["PLANNER", "OWNER", "VENDOR", "ADMIN"] as const;
export type AppRole = (typeof APP_ROLES)[number];

/** Roles a user may choose for themselves during sign-up. */
export const SELF_SERVE_ROLES = ["PLANNER", "OWNER", "VENDOR"] as const;
export type SelfServeRole = (typeof SELF_SERVE_ROLES)[number];

export function parseRole(value: unknown): AppRole | null {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase();
  return (APP_ROLES as readonly string[]).includes(upper)
    ? (upper as AppRole)
    : null;
}

export function parseSelfServeRole(value: unknown): SelfServeRole | null {
  const role = parseRole(value);
  return role && role !== "ADMIN" ? role : null;
}

export function isHostRole(role: AppRole | null | undefined): boolean {
  return role === "OWNER" || role === "VENDOR" || role === "ADMIN";
}

/** Maps an app role onto the Prisma `UserRole` enum. */
export function toDbRole(role: AppRole): "PLANNER" | "OWNER" | "ADMIN" {
  if (role === "VENDOR") return "OWNER";
  return role;
}

/**
 * Decides the role after a (re-)registration request. Planners may upgrade to a
 * host role; existing hosts and admins are never silently downgraded or swapped.
 */
export function resolveRoleChange(
  current: AppRole | null,
  requested: SelfServeRole
): AppRole {
  if (!current) return requested;
  if (current === "PLANNER" && requested !== "PLANNER") return requested;
  return current;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  PLANNER: "Event planner",
  OWNER: "Venue owner",
  VENDOR: "Vendor",
  ADMIN: "Admin",
};

export function roleHomePath(role: AppRole): string {
  return isHostRole(role) ? "/dashboard/owner" : "/dashboard/user";
}

const BLOCKED_REDIRECT_PREFIXES = ["/sign-in", "/sign-up", "/sso-callback", "/onboarding"];

/** Only allow same-origin relative paths to prevent open redirects. */
export function sanitizeRedirect(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }
  if (BLOCKED_REDIRECT_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    return null;
  }
  return value;
}

export function buildOnboardingUrl(role: SelfServeRole, redirectTo?: string | null) {
  const params = new URLSearchParams({ role });
  const safe = sanitizeRedirect(redirectTo);
  if (safe) params.set("redirect", safe);
  return `/onboarding?${params.toString()}`;
}
