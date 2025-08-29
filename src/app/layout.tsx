import { CartProvider } from "@/components/providers/cart-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SnackBite - Delicious Bites, Anytime",
  description:
    "Fresh ingredients, bold flavors, and unforgettable taste experiences. Order now from SnackBite and satisfy your cravings with our premium snacks and drinks.",
  keywords:
    "restaurant, snacks, food delivery, burgers, drinks, fast food, fresh ingredients, modern restaurants landing page",
  authors: [{ name: "Witty Umosung" }],
  creator: "Pukkawit",
  openGraph: {
    title: "SnackBite - Delicious Bites, Anytime",
    description:
      "Fresh ingredients, bold flavors, and unforgettable taste experiences. Order now and satisfy your cravings!",
    url: "https://snackbite.com",
    siteName: "SnackBite",
    images: [
      {
        url: "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg",
        width: 1200,
        height: 630,
        alt: "SnackBite - Delicious Food",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnackBite - Delicious Bites, Anytime",
    description:
      "Fresh ingredients, bold flavors, and unforgettable taste experiences.",
    images: [
      "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg",
    ],
  },
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable}`}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            {children}
            <Toaster position="top-center" />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
