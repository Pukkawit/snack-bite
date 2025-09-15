"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UtensilsCrossed,
  LayoutDashboard,
  Clock,
  Smartphone,
  Users,
  Shield,
  Zap,
  Star,
  ArrowRight,
  Play,
  Database,
  Palette,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { WinterSaleBanner } from "@/components/winter-sale-banner";
import { ChatbotWidget } from "@/components/chatbot-widget";

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: UtensilsCrossed,
      title: "Dynamic Menu System",
      description:
        "Real-time menu updates with category filtering and professional food photography",
      details:
        "Manage your entire menu from one dashboard with instant updates across all platforms",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Ordering",
      description:
        "Seamless order placement directly through WhatsApp integration",
      details:
        "Customers can browse, add to cart, and place orders without leaving WhatsApp",
    },
    {
      icon: LayoutDashboard,
      title: "Admin Dashboard",
      description:
        "Comprehensive management panel for all restaurant operations",
      details:
        "Control menu items, banners, hours, and restaurant info in real-time",
    },
    {
      icon: Clock,
      title: "Smart Business Hours",
      description: "Automatic open/closed status with live hour management",
      details:
        "Customers always see current availability with highlighted time slots",
    },
  ];

  const stats = [
    { number: "99%", label: "Uptime Guarantee" },
    { number: "50+", label: "Restaurant Features" },
    { number: "24/7", label: "Customer Support" },
    { number: "100%", label: "Mobile Optimized" },
  ];

  const testimonials = [
    {
      name: "Okonkwo Chima",
      role: "Restaurant Owner",
      content:
        "SnackBite transformed our ordering process. WhatsApp integration increased our orders by 300%!",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      role: "Restaurant Owner",
      content:
        "SnackBite transformed our ordering process. WhatsApp integration increased our orders by 300%!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Food Business Manager",
      content:
        "The admin dashboard is incredibly intuitive. Managing our menu has never been easier.",
      rating: 5,
    },
    {
      name: "Enobong Emah",
      role: "Food Business Manager",
      content:
        "The admin dashboard is incredibly intuitive. Managing our menu has never been easier.",
      rating: 5,
    },
    {
      name: "Lisa Rodriguez",
      role: "Cafe Owner",
      content:
        "Multi-tenant support allowed us to manage all our locations from one platform.",
      rating: 5,
    },
    {
      name: "Adesanya Ibrahim",
      role: "Cafe Owner",
      content:
        "Multi-tenant support allowed us to manage all our locations from one platform.",
      rating: 5,
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <Badge
              variant="secondary"
              className="mb-4 px-4 py-2 text-sm font-medium"
            >
              🚀 Next.js 15 • TypeScript • Supabase
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl leading-tightest  md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-600  via-yellow-200 to-lime-500 bg-clip-text text-transparent md:leading-tight"
          >
            Transform Your Restaurant with SnackBite
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl leading-tight text-muted-foreground mb-8 max-w-3xl mx-auto md:leading-relaxed"
          >
            The complete restaurant platform with WhatsApp ordering, dynamic
            menus, admin dashboard, and multi-tenant support. Built for modern
            food businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="/auth/register">
              <Button
                size="lg"
                className="px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg rounded-full bg-transparent"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to Run a Modern Restaurant
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From menu management to WhatsApp ordering, SnackBite provides all
              the tools your restaurant needs to thrive in the digital age.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`p-6 rounded-2xl cursor-pointer transition-all ${
                    activeFeature === index
                      ? "bg-primary/10 border-2 border-primary/20"
                      : "bg-card hover:bg-card/80"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        activeFeature === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10"
                      }`}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        {feature.description}
                      </p>
                      {activeFeature === index && (
                        <p className="text-sm text-primary font-medium">
                          {feature.details}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/50 to-secondary/50 rounded-3xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🍔</div>
                  <h3 className="text-2xl font-bold mb-2">Interactive Demo</h3>
                  <p className="text-muted-foreground">
                    Experience SnackBite in action
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure & Reliable",
                desc: "Enterprise-grade security with 99.9% uptime",
              },
              {
                icon: Smartphone,
                title: "Mobile First",
                desc: "Optimized for all devices and screen sizes",
              },
              {
                icon: Users,
                title: "Multi-Tenant",
                desc: "Manage multiple restaurant locations",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Built with Next.js 15 for optimal performance",
              },
              {
                icon: Database,
                title: "Real-time Data",
                desc: "Instant updates across all platforms",
              },
              {
                icon: Palette,
                title: "Customizable",
                desc: "Brand your restaurant with custom themes",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Loved by Restaurant Owners
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers say about SnackBite
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">{`"${testimonial.content}"`}</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of restaurants already using SnackBite to streamline
              their operations and increase orders through WhatsApp integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-8 py-4 text-lg rounded-full"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link
                href={`https://wa.me/${encodeURIComponent(
                  "2348136289052"
                )}?text=${encodeURIComponent(
                  "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                )}`}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg rounded-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SnackBite
              </h3>
              <p className="text-muted-foreground mb-4">
                The complete restaurant platform for modern food businesses.
              </p>
              <div className="flex gap-4">
                <Link
                  href="https://github.com/pukkawit/snackbite"
                  className="text-muted-foreground hover:text-primary"
                >
                  GitHub
                </Link>
                <Link
                  href="https://www.linkedin.com/in/witty-umosung"
                  className="text-muted-foreground hover:text-primary"
                >
                  LinkedIn
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <Link
                  href={`https://wa.me/${encodeURIComponent(
                    "2348136289052"
                  )}?text=${encodeURIComponent(
                    "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                  )}`}
                  target="_blank"
                  className="block text-muted-foreground hover:text-primary"
                >
                  Features
                </Link>
                <Link
                  href={`https://wa.me/${encodeURIComponent(
                    "2348136289052"
                  )}?text=${encodeURIComponent(
                    "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                  )}`}
                  target="_blank"
                  className="block text-muted-foreground hover:text-primary"
                >
                  Pricing
                </Link>
                <Link
                  href="/auth/login"
                  className="block text-muted-foreground hover:text-primary"
                >
                  Demo
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <Link
                  href={`https://wa.me/${encodeURIComponent(
                    "2348136289052"
                  )}?text=${encodeURIComponent(
                    "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                  )}`}
                  target="_blank"
                  className="block text-muted-foreground hover:text-primary"
                >
                  About
                </Link>
                <Link
                  href={`https://wa.me/${encodeURIComponent(
                    "2348136289052"
                  )}?text=${encodeURIComponent(
                    "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                  )}`}
                  target="_blank"
                  className="block text-muted-foreground hover:text-primary"
                >
                  Contact
                </Link>
                <Link
                  href={`https://wa.me/${encodeURIComponent(
                    "2348136289052"
                  )}?text=${encodeURIComponent(
                    "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                  )}`}
                  target="_blank"
                  className="block text-muted-foreground hover:text-primary"
                >
                  Blog
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <Link
                  href={`https://wa.me/${encodeURIComponent(
                    "2348136289052"
                  )}?text=${encodeURIComponent(
                    "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                  )}`}
                  target="_blank"
                  className="block text-muted-foreground hover:text-primary"
                >
                  Documentation
                </Link>
                <Link
                  href={`https://wa.me/${encodeURIComponent(
                    "2348136289052"
                  )}?text=${encodeURIComponent(
                    "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                  )}`}
                  target="_blank"
                  className="block text-muted-foreground hover:text-primary"
                >
                  Help Center
                </Link>
                <Link
                  href={`https://wa.me/${encodeURIComponent(
                    "2348136289052"
                  )}?text=${encodeURIComponent(
                    "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                  )}`}
                  target="_blank"
                  className="block text-muted-foreground hover:text-primary"
                >
                  Status
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} SnackBite. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                href={`https://wa.me/${encodeURIComponent(
                  "2348136289052"
                )}?text=${encodeURIComponent(
                  "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                )}`}
                target="_blank"
                className="text-muted-foreground hover:text-primary"
              >
                Privacy
              </Link>
              <Link
                href={`https://wa.me/${encodeURIComponent(
                  "2348136289052"
                )}?text=${encodeURIComponent(
                  "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                )}`}
                target="_blank"
                className="text-muted-foreground hover:text-primary"
              >
                Terms
              </Link>
              <Link
                href="/cookies"
                target="_blank"
                className="text-muted-foreground hover:text-primary"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Elements */}
      <WinterSaleBanner
        title="SPECIAL OFFER"
        description="Get 50% off your first month when you sign up for SnackBite Pro!"
        buttonText="Claim Offer"
        onButtonClick={() =>
          window.open(
            `https://wa.me/${encodeURIComponent(
              "2348136289052"
            )}?text=${encodeURIComponent(
              "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
            )}`,
            "_blank"
          )
        }
        reappearInterval={45000}
      />

      <ChatbotWidget
        businessName="SnackBite Support"
        welcomeMessage="Hi! I'm here to help you learn more about SnackBite and answer any questions you have."
        vendorInfo={{
          name: "Support Team",
          isOnline: true,
          responseTime: "Usually replies within minutes",
        }}
        quickActions={[
          {
            label: "View Demo",
            action: () => {
              window.open(
                `https://wa.me/${encodeURIComponent(
                  "2348136289052"
                )}?text=${encodeURIComponent(
                  "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                )}`,
                "_blank"
              );
            },
          },
          {
            label: "Pricing Info",
            action: () => {
              window.open(
                `https://wa.me/${encodeURIComponent(
                  "2348136289052"
                )}?text=${encodeURIComponent(
                  "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
                )}`,
                "_blank"
              );
            },
          },
          {
            label: "Technical Support",
            action: () => {
              window.location.href = `https://wa.me/${encodeURIComponent(
                "2348136289052"
              )}?text=${encodeURIComponent(
                "Hi Pukkawit! I found your project at SnackBite and would like to discuss a project."
              )}`;
            },
          },
        ]}
      />
    </main>
  );
}
