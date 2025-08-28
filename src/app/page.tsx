"use client";

import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/sections/hero-section";
import { PromoBanner } from "@/components/sections/promo-banner";
import { AboutSection } from "@/components/sections/about-section";
import { MenuSection } from "@/components/sections/menu-section";
import { ContactSection } from "@/components/sections/contact-section";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export default function Home() {
  return (
    <main className="relative">
      <Header />
      <PromoBanner />
      <HeroSection />
      <AboutSection />
      <MenuSection />
      <ContactSection />
      <WhatsAppFloat />
      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border bg-muted">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 - {new Date().getFullYear()} Witty Umosung. Inspired by your
            Desire.
          </p>
        </div>
      </footer>
    </main>
  );
}
