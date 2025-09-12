"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useCartContext } from "@/providers/cart-provider";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { useProfile } from "@/hooks/db/getUserProfile";
import { useRestaurantName } from "@/hooks/db/getRestaurantName";
import { cn, getInitials, normalizeRestaurantName } from "@/lib/utils";

const navigation = [
  { name: "Home", id: "home" },
  { name: "About", id: "about" },
  { name: "Menu", id: "menu" },
  { name: "Contact", id: "contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount } = useCartContext();
  const [activeMenu, setActiveMenu] = useState("home");

  const getActiveMenu = (sectionId: string) => {
    navigation.forEach((nav) => nav.id === sectionId && setActiveMenu(nav.id));
  };

  const { profile } = useProfile();

  const { data: restaurantName } = useRestaurantName(
    profile?.userId ?? "SnackBite"
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if ((isMenuOpen || isCartOpen) && !target.closest("header")) {
        setIsMenuOpen(false);
        setIsCartOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (
        (event.key === "Escape" && isMenuOpen) ||
        (event.key === "Escape" && isCartOpen)
      ) {
        setIsMenuOpen(false);
        setIsCartOpen(false);
      }
    };

    if (isMenuOpen || isCartOpen) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, isCartOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    getActiveMenu(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
      setIsCartOpen(false);
    }
    console.log(activeMenu);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg"
            : "dark:bg-transparent bg-background/75 border-b border-border/20 shadow-md"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary via-accent to-secondary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {getInitials(restaurantName)}
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">
                {normalizeRestaurantName(restaurantName)}
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "relative text-muted-foreground hover:text-foreground transition-all duration-300 group py-2",
                    item.id === activeMenu && "text-foreground"
                  )}
                >
                  {item.name}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full",
                      item.id === activeMenu ? "w-full" : ""
                    )}
                  />
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-t"
            >
              <div className="px-4 py-2 space-y-1">
                {navigation.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "flex hover:bg-primary/20 px-3 py-2 text-foreground/40 hover:text-foreground transition-all duration-300 group",
                      item.id === activeMenu && "text-foreground"
                    )}
                  >
                    {item.name}
                    <span
                      className={cn(
                        "flex absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full",
                        item.id === activeMenu ? "w-full" : ""
                      )}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
