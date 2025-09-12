import type { Metadata } from "next";
import Register from "@/components/auth/register";

export const metadata: Metadata = {
  title: "SnackBite - Register Page",
  description: "Secure register page with ",
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

export default function LoginPage() {
  return (
    <div className="min-h-screen py-16 flex items-center justify-center flex-col">
      <Register />
    </div>
  );
}
