"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Phone, Mail, Navigation } from "lucide-react";
import {
  supabase,
  type OpeningHours,
  type RestaurantInfo,
} from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const daysOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function ContactSection() {
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(
    null
  );

  useEffect(() => {
    fetchOpeningHours();
    fetchRestaurantInfo();
  }, []);

  const fetchOpeningHours = async () => {
    const { data, error } = await supabase
      .from("snack_bite_opening_hours")
      .select("*");

    if (error) {
      console.error("Error fetching opening hours:", error);
      return;
    }

    const sortedHours = (data || []).sort(
      (a, b) =>
        daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week)
    );
    setOpeningHours(sortedHours);
  };

  const fetchRestaurantInfo = async () => {
    const { data, error } = await supabase
      .from("snack_bite_restaurant_info")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching restaurant info:", error);
      return;
    }

    setRestaurantInfo(data);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCurrentDayStatus = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todayHours = openingHours.find((h) => h.day_of_week === today);

    if (!todayHours || todayHours.is_closed) {
      return { status: "Closed", color: "text-red-500" };
    }

    const now = new Date();
    const [openHour, openMinute] = todayHours.open_time.split(":").map(Number);
    const [closeHour, closeMinute] = todayHours.close_time
      .split(":")
      .map(Number);

    const openTime = new Date(now);
    openTime.setHours(openHour, openMinute, 0, 0);

    const closeTime = new Date(now);
    closeTime.setHours(closeHour, closeMinute, 0, 0);

    if (now >= openTime && now <= closeTime) {
      return { status: "Open Now", color: "text-green-500" };
    } else if (now < openTime) {
      return {
        status: `Opens at ${formatTime(todayHours.open_time)}`,
        color: "text-orange-500",
      };
    } else {
      return { status: "Closed", color: "text-red-500" };
    }
  };

  const currentStatus = getCurrentDayStatus();

  return (
    <section id="contact" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Visit Us</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Come and taste our delicious offerings or order for pickup and
            delivery
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Opening Hours
                  <span
                    className={`text-sm font-medium ${currentStatus.color}`}
                  >
                    • {currentStatus.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {openingHours.map((hours) => (
                  <div
                    key={hours.id}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium">{hours.day_of_week}</span>
                    <span className="text-muted-foreground">
                      {hours.is_closed
                        ? "Closed"
                        : `${formatTime(hours.open_time)} - ${formatTime(
                            hours.close_time
                          )}`}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-orange-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {restaurantInfo?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground text-sm">
                        {restaurantInfo.address}
                      </p>
                    </div>
                  </div>
                )}

                {restaurantInfo?.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a
                        href={`tel:${restaurantInfo.phone}`}
                        className="text-muted-foreground text-sm hover:text-orange-600 transition-colors"
                      >
                        {restaurantInfo.phone}
                      </a>
                    </div>
                  </div>
                )}

                {restaurantInfo?.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href={`mailto:${restaurantInfo.email}`}
                        className="text-muted-foreground text-sm hover:text-orange-600 transition-colors"
                      >
                        {restaurantInfo.email}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Find Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  {restaurantInfo?.google_maps_embed ? (
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{
                        __html: restaurantInfo.google_maps_embed,
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Map will be loaded here
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-lg">
                  <h4 className="font-semibold text-orange-600 mb-2">
                    Delivery & Pickup Available
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    We offer both pickup and delivery services. Order through
                    WhatsApp for the fastest service!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
