"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, Gift, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { fetchTenantIdBySlug } from "@/lib/utils";
import { useParams } from "next/navigation";

export function PromoBanner() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const params = useParams();
  const tenantSlug = params.tenantSlug as string | undefined;

  /* const tenantId = async () => {
    const tenantId = await fetchTenantIdBySlug(tenantSlug || "");
    return tenantId;
  }; */

  useEffect(() => {
    const fetchPromoBanners = async () => {
      const tenantId = await fetchTenantIdBySlug(tenantSlug || "");

      const { data, error } = await supabase
        .from("snack_bite_promo_banners")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("active", true)
        .or("expires_at.is.null,expires_at.gt.now()");

      if (error) {
        console.error("Error fetching promo banners:", error);
        return;
      }

      setBanners(data || []);
    };

    fetchPromoBanners();
  }, [tenantSlug]);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  if (!isVisible || banners.length === 0) {
    return null;
  }

  const banner = banners[currentBanner];

  const getIconForBanner = (title: string) => {
    const titleToLowerCase = title.toLowerCase();
    if (
      titleToLowerCase.includes("sale") ||
      titleToLowerCase.includes("discount")
    )
      return Gift;
    if (titleToLowerCase.includes("new") || titleToLowerCase.includes("launch"))
      return Zap;
    return Sparkles;
  };

  const IconComponent = getIconForBanner(banner.title);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.6,
        }}
        className="fixed top-16 left-0 right-0 z-40 shadow-lg"
      >
        <div
          className="relative overflow-hidden backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${banner.background_color}ee, ${banner.background_color}dd)`,
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-slow" />
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                                 radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          </div>

          <div className="container mx-auto px-4 py-2 relative">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <motion.div
                  className="flex-shrink-0 p-2 rounded-full bg-white/20 backdrop-blur-sm"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <IconComponent
                    className="h-6 w-6 drop-shadow-sm"
                    style={{ color: banner.text_color }}
                  />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.h3
                    className="font-bold text-lg md:text-xl leading-tight text-balance"
                    style={{ color: banner.text_color }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {banner.title}
                  </motion.h3>
                  {banner.description && (
                    <motion.p
                      className="text-sm md:text-base opacity-90 leading-relaxed text-pretty hidden sm:block mt-1"
                      style={{ color: banner.text_color }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {banner.description}
                    </motion.p>
                  )}
                </div>

                <motion.div
                  className="hidden md:flex"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                    style={{
                      color: banner.text_color,
                      borderColor: `${banner.text_color}40`,
                    }}
                  >
                    <span className="text-sm font-medium">Learn More</span>
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </div>

              {banners.length > 1 && (
                <div className="flex gap-2 mx-4">
                  {banners.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentBanner(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentBanner
                          ? "bg-white shadow-lg scale-125"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="flex-shrink-0 hover:bg-white/20 p-2 rounded-full transition-all duration-300 hover:scale-110 group"
                  style={{ color: banner.text_color }}
                >
                  <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
                </Button>
              </motion.div>
            </div>

            <motion.div
              className="md:hidden mt-3 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                style={{
                  color: banner.text_color,
                  borderColor: `${banner.text_color}40`,
                }}
              >
                <span className="text-sm font-medium">Learn More</span>
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
