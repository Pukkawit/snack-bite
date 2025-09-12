"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Phone, Mail, Navigation } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { cn, fetchTenantIdBySlug } from "@/lib/utils";
import { useOpeningHoursSection } from "@/hooks/db/useOpeningHoursSection";

type RestaurantInfo = {
  address?: string;
  phone?: string;
  email?: string;
  google_maps_embed?: string;
};

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function ContactSection() {
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(
    null
  );

  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const { data: openingHours = [], isLoading } =
    useOpeningHoursSection(tenantSlug);

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      const tenantId = await fetchTenantIdBySlug(tenantSlug);
      const { data, error } = await supabase
        .from("snack_bite_restaurant_info")
        .select("*")
        .eq("tenant_id", tenantId)
        .single();

      if (error) {
        console.error("Error fetching restaurant info:", error);
        return;
      }

      setRestaurantInfo(data);
    };

    fetchRestaurantInfo();
  }, [tenantSlug]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCurrentDayStatus = () => {
    const todayIdx = new Date().getDay(); // 0=Sunday
    const todaySlots = openingHours.filter((h) => h.day_of_week === todayIdx);

    if (todaySlots.length === 0) {
      return { status: "Closed", color: "text-red-500" };
    }

    const now = new Date();
    const isOpen = todaySlots.some((slot) => {
      const [openHour, openMinute] = slot.open_time.split(":").map(Number);
      const [closeHour, closeMinute] = slot.close_time.split(":").map(Number);

      const openTime = new Date(now);
      openTime.setHours(openHour, openMinute, 0, 0);

      const closeTime = new Date(now);
      closeTime.setHours(closeHour, closeMinute, 0, 0);

      return now >= openTime && now <= closeTime;
    });

    if (isOpen) {
      return { status: "Open Now", color: "text-green-500" };
    }

    // If not open now, find the next slot today
    const futureSlot = todaySlots.find((slot) => {
      const [openHour, openMinute] = slot.open_time.split(":").map(Number);
      const openTime = new Date(now);
      openTime.setHours(openHour, openMinute, 0, 0);
      return now < openTime;
    });

    if (futureSlot) {
      return {
        status: `Opens at ${formatTime(futureSlot.open_time)}`,
        color: "text-orange-500",
      };
    }

    return { status: "Closed", color: "text-red-500" };
  };

  const groupedByDay = dayNames.map((day, idx) => {
    const slots = openingHours.filter((h) => h.day_of_week === idx);
    return { day, slots };
  });

  const currentStatus = getCurrentDayStatus();

  if (isLoading) {
    return (
      <div id="contact" className="py-20 bg-muted/50">
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
            <Card className="animate-pulse">
              {/* Card Header Skeleton */}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </CardHeader>
              {/* Card Content Skeleton */}
              <CardContent className="space-y-3">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border-b border-b-muted-foreground/30 last:border-b-0 pb-1"
                  >
                    {/* Day Name Placeholder */}
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    {/* Time Slots Placeholder */}
                    <div className="flex flex-col items-end space-y-0.5">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              {/* Card Header Skeleton */}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </CardHeader>
              {/* Card Content Skeleton */}
              <CardContent className="space-y-3">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border-b border-b-muted-foreground/30 last:border-b-0 pb-1"
                  >
                    {/* Day Name Placeholder */}
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    {/* Time Slots Placeholder */}
                    <div className="flex flex-col items-end space-y-0.5">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="contact" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
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
          {/* Opening Hours & Contact */}
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
                {groupedByDay.map(({ day, slots }) => {
                  const now = new Date();
                  const today = now.toLocaleDateString("en-US", {
                    weekday: "long",
                  });
                  const isToday = day === today;

                  return (
                    <div
                      key={day}
                      className="flex justify-between items-center border-b border-b-muted-foreground/30 last:border-b-0 pb-1"
                    >
                      {/* Highlight the day name only if it's today */}
                      <span
                        className={
                          isToday ? "font-medium text-success" : "font-medium"
                        }
                      >
                        {day}
                      </span>

                      <span className="flex flex-col items-end text-muted-foreground text-sm space-y-0.5">
                        {slots.length === 0 ? (
                          <span className="text-destructive">Closed</span>
                        ) : (
                          slots.map((s) => {
                            const timeRange = `${formatTime(
                              s.open_time
                            )} - ${formatTime(s.close_time)}`;

                            const parseTime = (timeStr: string) => {
                              const [time, modifier] = timeStr.split(" "); // e.g. ["9:00", "AM"]
                              const timeParts = time.split(":").map(Number);
                              let hours = timeParts[0];
                              const mins = timeParts[1];

                              if (modifier === "PM" && hours !== 12)
                                hours += 12;
                              if (modifier === "AM" && hours === 12) hours = 0; // midnight case

                              return new Date(
                                now.getFullYear(),
                                now.getMonth(),
                                now.getDate(),
                                hours,
                                mins
                              );
                            };

                            const [startStr, endStr] = timeRange.split(" - ");
                            const start = parseTime(startStr);
                            const end = parseTime(endStr);

                            // highlight states
                            const isActive =
                              isToday && now >= start && now <= end;
                            const isUpcoming = isToday && now < start;

                            return (
                              <div
                                key={timeRange}
                                className={cn(
                                  "border-b border-b-muted-foreground/30 last:border-b-0 pb-1",
                                  isUpcoming
                                    ? "text-info font-medium"
                                    : isActive
                                    ? "text-success font-semibold"
                                    : "text-muted-foreground"
                                )}
                              >
                                {timeRange}
                              </div>
                            );
                          })
                        )}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Contact Info */}
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

          {/* Map */}
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
