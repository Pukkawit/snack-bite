import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/sections/hero-section";
import { PromoBanner } from "@/components/sections/promo-banner";
import { AboutSection } from "@/components/sections/about-section";
import { MenuSection } from "@/components/sections/menu-section";
import { ContactSection } from "@/components/sections/contact-section";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { PromoBannerDynamic } from "@/components/promo-banner-dynamic";

export default function Home() {
  return (
    <main className="relative">
      <Header />
      <PromoBanner />
      <HeroSection />
      <AboutSection />
      <PromoBannerDynamic
        promos={[
          {
            title: "WEB DEV SPECIAL",
            description:
              "1-Page Business Website in 5 days (Next.js + Tailwind) — ₦70k",
            actionButtonText: "Get Started",
            actionButtonIcon: "code",
            buttonAction: {
              type: "whatsapp",
              value: "+2348136289052",
              metadata: {
                message:
                  "Hi! I'm interested in the 1-Page Business Website package for ₦70k. Can we discuss the details?",
                businessName: "@Witty Umosung",
              },
            },
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
                message:
                  "I need Figma to Next.js conversion for up to 5 screens. Let's discuss!",
                businessName: "Your Business",
              },
            },
          },
          {
            title: "SPEED BOOST",
            description:
              "Bug-fix & Speed Boost (Core Web Vitals) — ₦30k starter",
            actionButtonText: "Fix My Site",
            actionButtonIcon: "zap",
            buttonAction: {
              type: "email",
              value: "hello@yourbusiness.com",
              metadata: {
                subject: "Website Speed Optimization Request",
                body: "I need help with bug fixes and speed optimization for my website.",
              },
            },
          },
        ]}
        decorativeIcons={["code", "palette", "zap", "monitor"]}
        floatingIcons={["activity", "guage", "figma", "webhook"]}
        reappearInterval={30000}
        rotationInterval={10000}
      />
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
