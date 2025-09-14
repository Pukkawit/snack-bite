"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { X, Snowflake, Gift, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WinterSaleBannerProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  reappearInterval?: number; // in milliseconds
}

export function WinterSaleBanner({
  title = "WINTER SALE",
  description = "Take 50% off a range of goods in our end of season sale. All sales final - ends soon!",
  buttonText = "Shop Sale",
  onButtonClick,
  reappearInterval = 30000, // 30 seconds
}: WinterSaleBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosedByUser, setIsClosedByUser] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(bannerRef, { once: false, margin: "-100px" });

  // Handle reappearing after user closes
  useEffect(() => {
    if (isClosedByUser) {
      const timer = setTimeout(() => {
        setIsClosedByUser(false);
        setIsVisible(true);
      }, reappearInterval);

      return () => clearTimeout(timer);
    }
  }, [isClosedByUser, reappearInterval]);

  // Show banner only when in view and not closed by user
  const shouldShow = isInView && isVisible && !isClosedByUser;

  const handleClose = () => {
    setIsVisible(false);
    setIsClosedByUser(true);
  };

  const handleButtonClick = () => {
    onButtonClick?.();
  };

  // Snowflake component
  const Snowflakes = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-white/20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -50,
            rotate: 0,
          }}
          animate={{
            y: window.innerHeight + 50,
            x: Math.random() * window.innerWidth,
            rotate: 360,
          }}
          transition={{
            duration: Math.random() * 3 + 5,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        >
          <Snowflake size={Math.random() * 20 + 10} />
        </motion.div>
      ))}
    </div>
  );

  // Morphing background shapes
  const MorphingShapes = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-secondary/10"
        animate={{
          borderRadius: [
            "50% 30% 70% 40%",
            "30% 60% 40% 70%",
            "70% 40% 30% 60%",
            "40% 70% 60% 30%",
            "50% 30% 70% 40%",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-tl from-secondary/10 to-primary/10"
        animate={{
          borderRadius: [
            "40% 70% 60% 30%",
            "70% 40% 30% 60%",
            "30% 60% 40% 70%",
            "50% 30% 70% 40%",
            "40% 70% 60% 30%",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );

  return (
    <div ref={bannerRef} className="relative w-full py-8">
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.6,
            }}
            className="relative mx-auto max-w-6xl"
          >
            {/* Main Banner Container */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--winter-gradient-start)] via-white to-[var(--winter-gradient-end)] p-8 md:p-12 shadow-2xl border border-primary/20">
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              />

              {/* Morphing Shapes */}
              <MorphingShapes />

              {/* Snowflakes */}
              <Snowflakes />

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X size={16} />
              </Button>

              {/* Content Grid */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Side - Title */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="relative"
                  >
                    <motion.h1
                      className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-none tracking-tight"
                      animate={{
                        textShadow: [
                          "0 0 20px var(--sale-glow)",
                          "0 0 40px var(--sale-glow)",
                          "0 0 20px var(--sale-glow)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      {title}
                    </motion.h1>

                    {/* Decorative Icons */}
                    <motion.div
                      className="absolute -top-4 -right-4 text-primary"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles size={32} />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Right Side - Description & CTA */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="space-y-6 text-center lg:text-left"
                >
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    {description}
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleButtonClick}
                      size="lg"
                      className="relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-lg group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                      <span className="relative flex items-center gap-2">
                        <ShoppingBag size={20} />
                        {buttonText}
                      </span>
                    </Button>
                  </motion.div>

                  {/* Floating Icons */}
                  <div className="flex justify-center lg:justify-start gap-4 mt-6">
                    {[Gift, ShoppingBag, Sparkles].map((Icon, index) => (
                      <motion.div
                        key={index}
                        className="text-primary/60"
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: index * 0.5,
                          ease: "easeInOut",
                        }}
                      >
                        <Icon size={24} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Bottom Accent Line */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
