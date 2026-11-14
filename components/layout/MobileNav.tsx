"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCreateListingModal } from "@/store/useCreateListingModal";
import { useClerkAuthFlow } from "@/hooks/useClerkAuthFlow";
import { isHostRole } from "@/lib/roles";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { open: openCreateListing } = useCreateListingModal();
  const { isSignedIn, currentRole, startGoogleAuth } = useClerkAuthFlow();

  const navItems = [
    { href: "/explore", label: "Explore Marketplace" },
    ...(isSignedIn
      ? [
          { href: "/account", label: "My Account" },
          ...(!isHostRole(currentRole)
            ? [{ href: "/dashboard/user", label: "My Bookings & Budget" }]
            : []),
        ]
      : []),
  ];

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="btn !px-3 !py-1.5 text-xs rounded-full"
        aria-expanded={open}
        aria-label="Toggle navigation menu"
      >
        {open ? "Close" : "Menu"}
      </button>

      {open && (
        <div
          className="fixed inset-x-0 top-[64px] z-50 border-b border-[var(--ink)] bg-[var(--bg)] px-7 py-6 shadow-2xl"
          role="dialog"
          aria-label="Mobile navigation"
        >
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`serif text-2xl no-underline ${
                    isActive ? "text-[var(--ink)] underline" : "text-[var(--ink)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {isSignedIn ? (
              isHostRole(currentRole) && (
                <div className="pt-3 border-t border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openCreateListing(
                        currentRole === "VENDOR" ? "vendor" : "venue"
                      );
                    }}
                    className="btn btn-filled w-full"
                  >
                    + List{" "}
                    {currentRole === "VENDOR" ? "Vendor Service" : "a Venue"}
                  </button>
                </div>
              )
            ) : (
              <div className="pt-3 border-t border-[var(--line)] flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    startGoogleAuth("PLANNER");
                  }}
                  className="btn btn-filled w-full"
                >
                  Login using Google (User)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    startGoogleAuth("OWNER", "/dashboard/owner");
                  }}
                  className="btn w-full"
                >
                  Register as a Venue Owner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    startGoogleAuth("VENDOR", "/dashboard/owner");
                  }}
                  className="btn w-full"
                >
                  Register as a Vendor
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
