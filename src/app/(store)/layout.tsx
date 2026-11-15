
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";

export const metadata: Metadata = {
  title: "Duggu Arts - Handmade Pipe Cleaner Flowers",
  description:
    "Beautiful handmade pipe-cleaner flowers crafted with love. Roses, tulips, daisies, and custom bouquets for every occasion.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Fixed navbar */}
      <Navbar />

      {/* Reserve space for navbar, then show announcement */}
      <div className="pt-16 lg:pt-20">
        <AnnouncementBar
          dismissible={true}
          autoRotate={true}
          rotationInterval={5000}
        />

        {/* Page content */}
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
      </div>

      <Footer />
    </>
  );
}
