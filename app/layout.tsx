import type { Metadata } from "next";
import { Suspense } from "react";
import { Instrument_Serif, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import CreateListingModal from "@/components/modals/CreateListingModal";
import FilterModal from "@/components/modals/FilterModal";
import RegisterModal from "@/components/modals/RegisterModal";
import { Toaster } from "@/components/ui/Toaster";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MG-Events · Book venues directly",
  description:
    "Set a budget, browse verified venues and vendors with live availability, and book straight with the owner. The price you see is the price you pay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        data-scroll-behavior="smooth"
        className={`${instrumentSerif.variable} ${inter.variable}`}
      >
        <body>
          <QueryProvider>
            <Suspense
              fallback={
                <header className="site-header">
                  <div className="wrap">
                    <span className="logo">MG—Events</span>
                  </div>
                </header>
              }
            >
              <Navbar />
            </Suspense>
            {children}
            <Footer />
            <CreateListingModal />
            <FilterModal />
            <RegisterModal />
            <Toaster />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
