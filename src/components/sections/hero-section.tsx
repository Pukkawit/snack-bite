"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRestaurantName } from "@/hooks/db/getRestaurantName";
import { normalizeRestaurantName } from "@/lib/utils";
import { useRestaurantInfo } from "@/hooks/db/useRestaurantInfo";
import { useParams } from "next/navigation";
import { OpeningHour } from "@/types/opening-hours";
import { useOpeningHoursSection } from "@/hooks/db/useOpeningHoursSection";

/* const heroImages = [
  {
    src: "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg",
    alt: "Delicious burger with fresh ingredients",
  },
  {
    src: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
    alt: "Fresh pizza with melted cheese",
  },
  {
    src: "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg",
    alt: "Colorful salad bowl with vegetables",
  },
  {
    src: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg",
    alt: "Grilled steak with sides",
  },
  {
    src: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    alt: "Pasta dish with fresh herbs",
  },
]; */

/* function formatTime(time: string) {
  return dayjs(time, "HH:mm:ss").format("h:mm A");
  }
 */

const formatTime = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":"); // ignore seconds
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getTodayStatus = (openingHours: OpeningHour[]) => {
  const now = new Date();
  const todayIdx = now.getDay(); // 0=Sunday, 6=Saturday
  const todaySlots = openingHours.filter((h) => h.day_of_week === todayIdx);

  if (todaySlots.length === 0) {
    return { isOpen: false, label: "Closed now" };
  }

  // check if any slot is currently active
  for (const slot of todaySlots) {
    const [openHour, openMinute] = slot.open_time.split(":").map(Number);
    const [closeHour, closeMinute] = slot.close_time.split(":").map(Number);

    const openTime = new Date(now);
    openTime.setHours(openHour, openMinute, 0, 0);

    const closeTime = new Date(now);
    closeTime.setHours(closeHour, closeMinute, 0, 0);

    if (now >= openTime && now <= closeTime) {
      return {
        isOpen: true,
        label: `Opening now. ${formatTime(slot.open_time)} - ${formatTime(
          slot.close_time
        )}`,
      };
    }
  }

  // not open now → check if a future slot today exists
  const futureSlot = todaySlots.find((slot) => {
    const [openHour, openMinute] = slot.open_time.split(":").map(Number);
    const openTime = new Date(now);
    openTime.setHours(openHour, openMinute, 0, 0);
    return now < openTime;
  });

  if (futureSlot) {
    return {
      isOpen: false,
      label: `Closed now. Opens at ${formatTime(futureSlot.open_time)}`,
    };
  }

  // fallback
  return { isOpen: false, label: "Closed now" };
};

export function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  const params = useParams();
  const tenantSlug = params.tenantSlug as string | undefined;

  const { data: restaurantInfo } = useRestaurantInfo(tenantSlug);

  const { data: restaurantName } = useRestaurantName(tenantSlug ?? "SnackBite");
  const { data: openingHours } = useOpeningHoursSection(tenantSlug);

  const openingStatus =
    openingHours && openingHours.length > 0
      ? getTodayStatus(openingHours)
      : { isOpen: false, label: "Open Daily 9AM - 11PM" };

  const heroImages =
    restaurantInfo?.hero_section?.imageUrls &&
    restaurantInfo.hero_section.imageUrls.length > 0
      ? restaurantInfo.hero_section.imageUrls.map(
          (file: ExistingFile, index: number) => ({
            src: file.url,
            alt: `hero-image-${index}` || "Hero image",
          })
        )
      : [];

  const tagLine =
    restaurantInfo?.hero_section.tagline || "Delicious Bites, Anytime";
  const description =
    restaurantInfo?.hero_section.description || "Delicious Bites, Anytime";

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        setIsTransitioning(false);
      }, 300);
    }, 10000); // Change image every 10 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800/95 to-black/75 z-20" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: isTransitioning ? 0.7 : 1,
              scale: isTransitioning ? 1.05 : 1,
              rotate: isTransitioning ? 0.5 : 0,
            }}
            exit={{ opacity: 0, scale: 0.95, rotate: -0.5 }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[currentImageIndex]?.src || "/placeholder.svg"}
              alt={
                heroImages[currentImageIndex]?.alt ||
                `Hero image ${currentImageIndex}`
              }
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
              priority={currentImageIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-20 right-8 z-30 flex flex-col gap-2">
          {heroImages.map((img: ExistingFile, index: number) => (
            <motion.div
              key={index}
              className={`w-2 h-8 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-white/80 shadow-lg"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              whileHover={{ scale: 1.2 }}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentImageIndex(index);
                  setIsTransitioning(false);
                }, 200);
              }}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: isTransitioning ? 0.9 : 1,
            y: isTransitioning ? -5 : 0,
          }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: isTransitioning ? 0.95 : 1,
              y: 0,
              scale: isTransitioning ? 1.02 : 1,
            }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight mt-8"
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
              {normalizeRestaurantName(restaurantName)}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-2xl md:text-3xl text-white/90 mb-2 max-w-2xl mx-auto"
          >
            {tagLine || "Delicious Bites, Anytime"}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg text-white/80 mb-12 max-w-xl mx-auto"
          >
            {description ||
              " Fresh ingredients, bold flavors, and unforgettable taste experiences. Order now and satisfy your cravings!"}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={scrollToMenu}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Order Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="border-2 border-muted bg-secondary-disabled text-accent hover:bg-secondary-active hover:text-accent-hover px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300"
            >
              Learn More
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row md:gap-6 gap-2 justify-center mt-6 text-white/80"
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-orange-400" />
              <span>{openingStatus.label}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-orange-400" />
              <span>
                {restaurantInfo?.address || "123 Food Street, Flavor Town"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
