"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useBookings } from "@/hooks/queries";
import { useCreateListingModal } from "@/store/useCreateListingModal";
import { useClerkAuthFlow } from "@/hooks/useClerkAuthFlow";
import { isHostRole } from "@/lib/roles";
import {
  executePendingBookingOnce,
  peekPendingBooking,
} from "@/lib/pending-booking";
import { toast } from "@/lib/toast";
import { MobileNav } from "./MobileNav";
import { MyAccountDropdown } from "./MyAccountDropdown";
import { Moon, Plus, Sun } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isHome = pathname === "/";
  const { user, isLoaded, isSignedIn, currentRole, startGoogleAuth } =
    useClerkAuthFlow();
  const { open: openCreateListing } = useCreateListingModal();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const { data: bookings = [] } = useBookings(
    undefined,
    Boolean(mounted && isSignedIn && !isHostRole(currentRole)),
    "planner"
  );

  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") {
      setTheme(current);
    }
  }, []);

  // Global fallback: if Clerk redirected to "/" or "/account" after sign-in while a pending booking exists
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/sso-callback")
    ) {
      return;
    }

    if (!peekPendingBooking()) return;

    async function processPendingBooking() {
      const result = await executePendingBookingOnce({
        fullName: user?.fullName,
        firstName: user?.firstName,
        email: user?.primaryEmailAddress?.emailAddress,
        phone: user?.primaryPhoneNumber?.phoneNumber,
      });

      if (!result.executed || !result.pending) return;

      if (result.success && result.booking) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["bookings"] }),
          queryClient.invalidateQueries({ queryKey: ["listings"] }),
          queryClient.invalidateQueries({
            queryKey: ["availability", result.pending.listingId],
          }),
        ]);
        const code = result.booking.bookingCode || result.booking.id;
        toast(
          `Booking #${code} confirmed for ${result.pending.listingName}!`
        );
        router.push(
          `/listings/${result.pending.listingSlug}?booked=${encodeURIComponent(
            code
          )}`
        );
      } else {
        toast(
          result.error || "Could not complete booking for the selected date."
        );
        router.push(`/listings/${result.pending.listingSlug}`);
      }
    }

    processPendingBooking();
  }, [isLoaded, isSignedIn, pathname, user, queryClient, router]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const handleHostAction = () => {
    if (isSignedIn && isHostRole(currentRole)) {
      openCreateListing(currentRole === "VENDOR" ? "vendor" : "venue");
    } else {
      startGoogleAuth("OWNER", "/dashboard/owner");
    }
  };

  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="logo shrink-0" href={isHome ? "#top" : "/"}>
          MG—Events
        </Link>

        <nav className="links" aria-label="Primary">
          <Link href={isHome ? "#venues" : "/#venues"}>Venues</Link>
          <Link href={isHome ? "#vendors" : "/#vendors"}>Vendors</Link>
          <Link
            href="/explore"
            className={pathname.startsWith("/explore") ? "active" : ""}
          >
            Explore
          </Link>
          {mounted && isSignedIn && !isHostRole(currentRole) && (
            <Link
              href="/dashboard/user"
              className={pathname.startsWith("/dashboard") ? "active" : ""}
            >
              {`My Bookings (${bookings.length})`}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleHostAction}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] text-xs font-medium hover:opacity-90 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>
              {mounted && currentRole === "VENDOR"
                ? "List a service"
                : "List your venue"}
            </span>
          </button>

          <MyAccountDropdown />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle editorial color theme"
            title="Switch Light / Dark Editorial Palette"
            className="h-9 w-9 rounded-full border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--ink)] hover:bg-[var(--soft)] hidden sm:inline-flex items-center justify-center transition cursor-pointer"
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
