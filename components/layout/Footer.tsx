import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <span>© 2026 MG-Events</span>
        <span className="flex flex-wrap items-center gap-1.5">
          <Link href="/#venues" className="no-underline hover:text-[var(--ink)]">
            Venues
          </Link>
          <span>·</span>
          <Link href="/#vendors" className="no-underline hover:text-[var(--ink)]">
            Vendors
          </Link>
          <span>·</span>
          <Link href="/explore" className="no-underline hover:text-[var(--ink)]">
            Explore
          </Link>
          <span>·</span>
          <Link
            href="/dashboard/user"
            className="no-underline hover:text-[var(--ink)]"
          >
            Planner Portal
          </Link>
          <span>·</span>
          <Link
            href="/dashboard/owner"
            className="no-underline hover:text-[var(--ink)]"
          >
            Owner Portal
          </Link>
          <span>·</span>
          <Link href="/#how" className="no-underline hover:text-[var(--ink)]">
            Privacy · Contact
          </Link>
        </span>
      </div>
    </footer>
  );
}
