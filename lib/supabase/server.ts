import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: "PLANNER" | "OWNER" | "ADMIN";
}

const DEMO_PLANNER: SessionUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "claire.mercer@example.com",
  fullName: "Claire & Daniel Mercer",
  phone: "+1 (212) 555-0194",
  role: "PLANNER",
};

const DEMO_OWNER: SessionUser = {
  id: "00000000-0000-4000-8000-000000000002",
  email: "clara@harborhall.local",
  fullName: "Clara Chen-strom",
  phone: "+1 (212) 555-0118",
  role: "OWNER",
};

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component where setting cookies is a no-op
        }
      },
    },
  });
}

/**
 * Resolves the authenticated Clerk user (or Supabase / Cookie session) and their RBAC role (`PLANNER` | `OWNER` | `ADMIN`).
 */
export async function getCurrentSessionUser(
  preferredRole: "PLANNER" | "OWNER" = "OWNER"
): Promise<SessionUser> {
  // 1. Check Clerk authenticated session first
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const cookieStore = await cookies();
      const cookieRole = cookieStore.get("mgevents_role")?.value?.toUpperCase();
      const metaRole = (
        (clerkUser.unsafeMetadata?.role as string) ||
        (clerkUser.publicMetadata?.role as string) ||
        cookieRole ||
        preferredRole
      ).toUpperCase();

      const resolvedRole: "PLANNER" | "OWNER" | "ADMIN" =
        metaRole === "OWNER" || metaRole === "VENDOR"
          ? "OWNER"
          : metaRole === "ADMIN"
          ? "ADMIN"
          : "PLANNER";

      const primaryEmail =
        clerkUser.emailAddresses?.[0]?.emailAddress || DEMO_OWNER.email;
      const fullName =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        primaryEmail.split("@")[0];

      return {
        id: clerkUser.id,
        email: primaryEmail,
        fullName,
        phone:
          clerkUser.phoneNumbers?.[0]?.phoneNumber || "+1 (212) 555-0199",
        role: resolvedRole,
      };
    }
  } catch {
    // Fallback if Clerk middleware is not active on this route
  }

  // 2. Check Supabase Auth if configured
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const metaRole = (user.user_metadata?.role as string)?.toUpperCase();
        const role: "PLANNER" | "OWNER" | "ADMIN" =
          metaRole === "OWNER" || metaRole === "ADMIN" ? metaRole : "PLANNER";

        return {
          id: user.id,
          email: user.email || DEMO_PLANNER.email,
          fullName:
            (user.user_metadata?.full_name as string) ||
            user.email?.split("@")[0] ||
            "MG-Events Member",
          phone: (user.user_metadata?.phone as string) || "+1 (212) 555-0199",
          role,
        };
      }
    } catch {
      // Fallback to seeded user
    }
  }

  return preferredRole === "OWNER" ? DEMO_OWNER : DEMO_PLANNER;
}
