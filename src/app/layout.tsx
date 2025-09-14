import { CartProvider } from "@/providers/cart-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { TanstackQueryProvider } from "@/providers/tanstack-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title:
    "SnackBite - Modern Restaurant Platform | WhatsApp Ordering & Menu Management",
  description:
    "SnackBite is a comprehensive restaurant web application with dynamic menus, WhatsApp ordering, admin dashboard, and multi-tenant support. Perfect for modern restaurants and food businesses.",
  keywords: [
    "restaurant app",
    "food ordering",
    "WhatsApp ordering",
    "restaurant management",
    "menu management",
    "food delivery",
    "restaurant platform",
    "multi-tenant restaurant",
    "online ordering system",
    "restaurant website",
    "food business",
    "restaurant admin panel",
  ],
  authors: [
    {
      name: "Witty Umosung (Pukkawit)",
      url: "https://portfolio-witty-umosung.vercel.app",
    },
  ],
  creator: "Pukkawit",
  publisher: "SnackBite Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://snackbite.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SnackBite - Modern Restaurant Platform",
    description:
      "Transform your restaurant with our comprehensive platform featuring WhatsApp ordering, dynamic menus, and powerful admin tools.",
    url: "https://snackbite.vercel.app",
    siteName: "SnackBite",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SnackBite Restaurant Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnackBite - Modern Restaurant Platform",
    description:
      "Transform your restaurant with WhatsApp ordering, dynamic menus, and powerful admin tools.",
    images: ["/og-image.jpg"],
    creator: "@pukkawit",
  },
  category: "technology",
  generator: "Next.js",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`font-sans`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "SnackBite",
              description:
                "Modern restaurant platform with WhatsApp ordering and menu management",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "Witty Umosung",
                url: "https://portfolio-witty-umosung.vercel.app",
              },
              publisher: {
                "@type": "Organization",
                name: "SnackBite Team",
              },
              featureList: [
                "Dynamic Menu System",
                "WhatsApp Ordering Integration",
                "Admin Dashboard",
                "Multi-tenant Support",
                "Business Hours Management",
                "Promotional Banner System",
              ],
            }),
          }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <TanstackQueryProvider>
              <TooltipProvider>
                <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
                <Analytics />
              </TooltipProvider>

              <Toaster position="top-center" />
            </TanstackQueryProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
