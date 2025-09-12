"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDynamicIcon } from "@/lib/dynamic-promo/dynamic-icons";
import {
  ActionConfig,
  handleAction,
  type ActionType,
} from "@/lib/dynamic-promo/action-handlers";

interface PromoData {
  title: string;
  description: string;
  actionButtonText: string;
  actionButtonIcon?: string;
  buttonAction: {
    type: ActionType;
    value: string;
    metadata?: {
      message?: string;
      businessName?: string;
      subject?: string;
      body?: string;
      openInNewTab?: boolean;
      behavior?: "smooth" | "instant";
      block?: "start" | "center" | "end";
      displayText?: string;
      filename?: string;
    };
  };
}

interface PromoBannerDynamicProps {
  promos: PromoData[];
  decorativeIcons?: string[];
  floatingIcons?: string[];
  reappearInterval?: number;
  rotationInterval?: number;
}

export function PromoBannerDynamic({
  promos,
  decorativeIcons = [],
  floatingIcons = [],
  reappearInterval = 30000,
  rotationInterval = 8000,
}: PromoBannerDynamicProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosedByUser, setIsClosedByUser] = useState(false);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(bannerRef, { once: false, margin: "-100px" });

  const currentPromo = promos[currentPromoIndex] || promos[0];

  useEffect(() => {
    if (promos.length > 1) {
      const timer = setInterval(() => {
        setCurrentPromoIndex((prev) => (prev + 1) % promos.length);
      }, rotationInterval);

      return () => clearInterval(timer);
    }
  }, [promos.length, rotationInterval]);

  useEffect(() => {
    if (isClosedByUser) {
      const timer = setTimeout(() => {
        setIsClosedByUser(false);
        setIsVisible(true);
      }, reappearInterval);

      return () => clearTimeout(timer);
    }
  }, [isClosedByUser, reappearInterval]);

  const shouldShow = isInView && isVisible && !isClosedByUser;

  const handleClose = () => {
    setIsVisible(false);
    setIsClosedByUser(true);
  };

  const handleButtonClick = () => {
    const actionConfig: ActionConfig = {
      type: currentPromo.buttonAction.type,
      data: {
        message: currentPromo.buttonAction.metadata?.message,
        subject: currentPromo.buttonAction.metadata?.subject,
        body: currentPromo.buttonAction.metadata?.body,
        url: currentPromo.buttonAction.value,
        target: currentPromo.buttonAction.metadata?.openInNewTab
          ? "_blank"
          : "_self",
        elementId: currentPromo.buttonAction.value,
        filename: currentPromo.buttonAction.metadata?.filename,
      },
    };
    handleAction(actionConfig);
  };

  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => {
        const iconName = decorativeIcons[i % decorativeIcons.length];
        const ParticleIcon = iconName ? getDynamicIcon(iconName) : null;
        return ParticleIcon ? (
          <motion.div
            key={i}
            className="absolute text-primary/20"
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1200),
              y: -50,
              rotate: 0,
            }}
            animate={{
              y:
                (typeof window !== "undefined" ? window.innerHeight : 800) + 50,
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1200),
              rotate: 360,
            }}
            transition={{
              duration: Math.random() * 3 + 6,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          >
            <ParticleIcon size={Math.random() * 16 + 12} />
          </motion.div>
        ) : null;
      })}
    </div>
  );

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
    <div ref={bannerRef} className="relative w-full py-4">
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            key={currentPromoIndex}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--winter-gradient-start)] via-background to-[var(--winter-gradient-end)] p-8 md:p-12 shadow-2xl border border-primary/20">
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

              {decorativeIcons.length > 0 && <FloatingParticles />}

              <MorphingShapes />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X size={16} />
              </Button>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="relative"
                  >
                    <motion.h1
                      className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-none tracking-tight text-balance"
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
                      {currentPromo.title}
                    </motion.h1>

                    {decorativeIcons[0] &&
                      (() => {
                        const DecorativeIcon = getDynamicIcon(
                          decorativeIcons[0]
                        );
                        return DecorativeIcon ? (
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
                            <DecorativeIcon size={32} />
                          </motion.div>
                        ) : null;
                      })()}
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="space-y-6 text-center lg:text-left"
                >
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                    {currentPromo.description}
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
                        {currentPromo.actionButtonIcon &&
                          (() => {
                            const ButtonIcon = getDynamicIcon(
                              currentPromo.actionButtonIcon
                            );
                            return ButtonIcon ? <ButtonIcon size={20} /> : null;
                          })()}
                        {currentPromo.actionButtonText}
                      </span>
                    </Button>
                  </motion.div>

                  {floatingIcons.length > 0 && (
                    <div className="flex justify-center lg:justify-start gap-4 mt-6">
                      {floatingIcons
                        .slice(0, floatingIcons.length)
                        .map((iconName, index) => {
                          const Icon = getDynamicIcon(iconName);
                          return Icon ? (
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
                          ) : null;
                        })}
                    </div>
                  )}
                </motion.div>
              </div>

              {promos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {promos.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentPromoIndex
                          ? "bg-primary"
                          : "bg-primary/30"
                      }`}
                      animate={{
                        scale: index === currentPromoIndex ? 1.2 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              )}

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

/* 

https://api.whatsapp.com/send/?phone=2348136289052&text=Hi+Pukkawit%21+I+found+your+portfolio+and+would+like+to+discuss+a+project.&type=phone_number&app_absent=0


*/

/*
=== USAGE EXAMPLES ===

// 1. WEB DEVELOPMENT SERVICES
<PromoBannerDynamic
  promos={[
    {
      title: "WEB DEV SPECIAL",
      description: "1-Page Business Website in 5 days (Next.js + Tailwind) — ₦70k",
      actionButtonText: "Get Started",
      actionButtonIcon: "code",
      buttonAction: {
        type: "whatsapp",
        value: "+2348123456789",
        metadata: {
          message: "Hi! I'm interested in the 1-Page Business Website package for ₦70k. Can we discuss the details?",
          businessName: "Your Business"
        }
      }
    },
    {
      title: "FIGMA TO CODE",
      description: "Figma → Next.js (up to 5 screens) — ₦50k",
      actionButtonText: "Order Now",
      actionButtonIcon: "mouse-pointer-click",
      buttonAction: {
        type: "whatsapp",
        value: "+2348123456789",
        metadata: {
          message: "I need Figma to Next.js conversion for up to 5 screens. Let's discuss!",
          businessName: "Your Business"
        }
      }
    },
    {
      title: "SPEED BOOST",
      description: "Bug-fix & Speed Boost (Core Web Vitals) — ₦30k starter",
      actionButtonText: "Fix My Site",
      actionButtonIcon: "zap",
      buttonAction: {
        type: "email",
        value: "hello@yourbusiness.com",
        metadata: {
          subject: "Website Speed Optimization Request",
          body: "I need help with bug fixes and speed optimization for my website."
        }
      }
    }
  ]}
  decorativeIcons={["code", "palette", "zap", "monitor"]}
  floatingIcons={["react", "nextjs", "figma"]}
  reappearInterval={45000}
  rotationInterval={10000}
/>

// 2. FOOD DELIVERY SERVICE
<PromoBannerDynamic
  promos={[
    {
      title: "LUNCH SPECIAL",
      description: "Free delivery on orders above ₦5,000. Fresh meals in 30 minutes!",
      actionButtonText: "Order Food",
      actionButtonIcon: "utensils",
      buttonAction: {
        type: "link",
        value: "https://yourfoodapp.com/menu",
        metadata: { openInNewTab: true }
      }
    }
  ]}
  decorativeIcons={["chef-hat", "utensils", "truck", "clock"]}
  floatingIcons={["pizza", "coffee", "ice-cream"]}
/>

// 3. FITNESS & WELLNESS
<PromoBannerDynamic
  promos={[
    {
      title: "FITNESS PROMO",
      description: "Join our 30-day transformation program. Get fit, stay healthy!",
      actionButtonText: "Start Journey",
      actionButtonIcon: "dumbbell",
      buttonAction: {
        type: "scroll",
        value: "fitness-programs",
        metadata: { behavior: "smooth" }
      }
    }
  ]}
  decorativeIcons={["dumbbell", "heart", "trophy", "target"]}
  floatingIcons={["activity", "zap", "star"]}
/>

// 4. E-COMMERCE SALE
<PromoBannerDynamic
  promos={[
    {
      title: "MEGA SALE",
      description: "Up to 70% off on electronics. Limited time offer!",
      actionButtonText: "Shop Now",
      actionButtonIcon: "shopping-cart",
      buttonAction: {
        type: "link",
        value: "/shop/electronics",
        metadata: { openInNewTab: false }
      }
    }
  ]}
  decorativeIcons={["shopping-bag", "gift", "percent", "tag"]}
  floatingIcons={["smartphone", "laptop", "headphones"]}
/>

// 5. EDUCATION & COURSES
<PromoBannerDynamic
  promos={[
    {
      title: "LEARN & GROW",
      description: "Master new skills with our expert-led courses. 50% off this month!",
      actionButtonText: "Enroll Now",
      actionButtonIcon: "graduation-cap",
      buttonAction: {
        type: "whatsapp",
        value: "+2348123456789",
        metadata: {
          message: "I'm interested in enrolling in your courses. Can you provide more details?",
          businessName: "EduCenter"
        }
      }
    }
  ]}
  decorativeIcons={["book", "graduation-cap", "lightbulb", "award"]}
  floatingIcons={["brain", "rocket", "star"]}
/>

=== RECOMMENDED ICONS BY SERVICE CATEGORY ===

// WEB DEVELOPMENT
decorativeIcons: ["code", "monitor", "palette", "zap", "cpu", "database", "git-branch", "terminal"]
floatingIcons: ["react", "nextjs", "typescript", "tailwind", "figma", "github"]
actionButtonIcons: "code", "mouse-pointer-click", "zap", "rocket", "play"

// FOOD & RESTAURANT
decorativeIcons: ["chef-hat", "utensils", "truck", "clock", "flame", "leaf", "heart"]
floatingIcons: ["pizza", "coffee", "ice-cream", "cake", "wine", "apple"]
actionButtonIcons: "utensils", "shopping-cart", "phone", "map-pin", "truck"

// FITNESS & HEALTH
decorativeIcons: ["dumbbell", "heart", "trophy", "target", "activity", "timer"]
floatingIcons: ["zap", "star", "award", "muscle", "running", "bike"]
actionButtonIcons: "dumbbell", "play", "calendar", "user-plus", "heart"

// E-COMMERCE & RETAIL
decorativeIcons: ["shopping-bag", "gift", "percent", "tag", "credit-card", "package"]
floatingIcons: ["smartphone", "laptop", "headphones", "watch", "camera", "gamepad"]
actionButtonIcons: "shopping-cart", "credit-card", "gift", "eye", "heart"

// EDUCATION & LEARNING
decorativeIcons: ["book", "graduation-cap", "lightbulb", "award", "brain", "bookmark"]
floatingIcons: ["rocket", "star", "trophy", "target", "puzzle", "key"]
actionButtonIcons: "graduation-cap", "play", "book-open", "user-plus", "download"

// REAL ESTATE
decorativeIcons: ["home", "building", "key", "map-pin", "ruler", "hammer"]
floatingIcons: ["house", "building-2", "trees", "car", "wifi", "shield"]
actionButtonIcons: "home", "phone", "calendar", "map-pin", "eye"

// BEAUTY & WELLNESS
decorativeIcons: ["sparkles", "heart", "flower", "sun", "droplet", "leaf"]
floatingIcons: ["star", "heart", "flower-2", "gem", "palette", "smile"]
actionButtonIcons: "sparkles", "calendar", "phone", "user-plus", "heart"

// TRAVEL & TOURISM
decorativeIcons: ["plane", "map", "camera", "compass", "luggage", "globe"]
floatingIcons: ["mountain", "palm-tree", "car", "ship", "tent", "binoculars"]
actionButtonIcons: "plane", "map-pin", "calendar", "phone", "camera"

// FINANCE & BANKING
decorativeIcons: ["dollar-sign", "trending-up", "shield", "lock", "calculator", "pie-chart"]
floatingIcons: ["coins", "credit-card", "bank", "chart-line", "safe", "gem"]
actionButtonIcons: "dollar-sign", "calculator", "phone", "user-plus", "shield"

// ENTERTAINMENT & EVENTS
decorativeIcons: ["music", "film", "mic", "party-popper", "ticket", "calendar"]
floatingIcons: ["guitar", "headphones", "camera-video", "gamepad", "popcorn", "confetti"]
actionButtonIcons: "play", "ticket", "calendar", "phone", "music"

=== ACTION TYPES REFERENCE ===

buttonAction: {
  type: "whatsapp",           // Opens WhatsApp with pre-filled message
  type: "email",              // Opens email client with subject/body
  type: "link",               // Navigates to URL (internal/external)
  type: "scroll",             // Scrolls to page section
  type: "phone",              // Opens phone dialer (mobile)
  type: "download"            // Downloads file
}

=== METADATA OPTIONS ===

// WhatsApp metadata
metadata: {
  message: "Pre-filled message text",
  businessName: "Your Business Name"
}

// Email metadata
metadata: {
  subject: "Email subject line",
  body: "Email body content"
}

// Link metadata
metadata: {
  openInNewTab: true/false
}

// Scroll metadata
metadata: {
  behavior: "smooth" | "instant",
  block: "start" | "center" | "end"
}

// Phone metadata
metadata: {
  displayText: "Call Now"
}

// Download metadata
metadata: {
  filename: "custom-filename.pdf"
}
*/
