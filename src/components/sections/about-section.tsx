"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Users, Clock, Heart } from "lucide-react";
import { supabase, type RestaurantInfo } from "@/lib/supabase";
import Image from "next/image";

const features = [
  {
    icon: Award,
    title: "Quality Ingredients",
    description:
      "We use only the freshest, locally-sourced ingredients in all our dishes.",
  },
  {
    icon: Users,
    title: "Family Recipes",
    description:
      "Our recipes have been passed down through generations of passionate cooks.",
  },
  {
    icon: Clock,
    title: "Fast Service",
    description: "Quick preparation without compromising on taste and quality.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every bite is crafted with care and attention to detail.",
  },
];

export function AboutSection() {
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(
    null
  );

  useEffect(() => {
    fetchRestaurantInfo();
  }, []);

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

  return (
    <section id="about" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {restaurantInfo?.description ||
              "We serve the most delicious snacks and refreshing drinks in town. Made fresh daily with the finest ingredients, our menu offers something special for every craving."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold">Passionate About Food</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At SnackBite, we believe that great food brings people together.
              Since our founding, we&apos;ve been committed to serving
              delicious, high-quality snacks that satisfy your cravings and
              create memorable experiences.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our chefs work tirelessly to perfect each recipe, ensuring that
              every bite delivers the perfect balance of flavors. From our
              signature burgers to our refreshing drinks, everything is made to
              order with love and attention to detail.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-orange-100 dark:bg-orange-900/20 px-4 py-2 rounded-full">
                <span className="text-orange-600 dark:text-orange-400 font-semibold">
                  Est. 2020
                </span>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-full">
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  1000+ Happy Customers
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <Image
                src="https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg"
                alt="Delicious burger"
                className="rounded-lg shadow-lg aspect-square object-cover"
                width={200}
                height={200}
              />
              <Image
                src="https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg"
                alt="Crispy chicken wings"
                className="rounded-lg shadow-lg aspect-square object-cover mt-8"
                width={200}
                height={200}
              />
              <Image
                src="https://images.pexels.com/photos/7613568/pexels-photo-7613568.jpeg"
                alt="Loaded nachos"
                className="rounded-lg shadow-lg aspect-square object-cover -mt-8"
                width={200}
                height={200}
              />
              <Image
                src="https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg"
                alt="Cheesecake slice"
                className="rounded-lg shadow-lg aspect-square object-cover"
                width={200}
                height={200}
              />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
