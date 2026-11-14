# Venue & Event Vendor Direct Booking Platform

A modern, full-stack **Two-Sided Event Marketplace** built with **Next.js 16** and **TypeScript**. The platform eliminates middlemen by connecting customers directly with property owners (wedding halls, farmhouses, rooftops) and event vendors, complete with role-based dashboards and administrative moderation.

---

## Key Features

### For Customers (Event Planners)
* **Direct Discovery & Booking:** Browse and filter wedding halls, farmhouses, rooftops, and event vendors without broker commissions.
* **Real-Time Data & Caching:** Fast search, availability viewing, and instant booking requests powered by TanStack Query.
* **Email Notifications:** Automated booking confirmations and status updates via Resend.

### For Venue Owners & Vendors
* **Property & Service Listings:** Create, update, and manage detailed listings with pricing, capacity, and amenities.
* **Media Management:** High-resolution photo uploads and optimization handled through Cloudinary.
* **Booking Management:** View incoming customer inquiries and manage booking schedules directly.

### Admin Dashboard (Moderation & Control)
* **Centralized Oversight:** Dedicated admin panel to monitor all registered venues, farmhouses, and vendor profiles across the platform.
* **Listing Moderation:** Inspect listing details and permanently delete policy-violating, duplicate, or fake listings to maintain platform trust.

---

## Tech Stack

* **Framework & Core:** Next.js 16 (App Router), React 19, TypeScript
* **Styling & UI:** Tailwind CSS v4 (Turbopack), shadcn/ui, Base UI, Lucide React Icons
* **Authentication & Role Management:** Clerk (`@clerk/nextjs`)
* **Database & ORM:** Supabase (PostgreSQL) with Prisma ORM
* **State Management:** Redux Toolkit & TanStack React Query v5
* **Forms & Validation:** React Hook Form & Zod
* **Media & Storage:** Cloudinary
* **Transactional Emails:** Resend

---
