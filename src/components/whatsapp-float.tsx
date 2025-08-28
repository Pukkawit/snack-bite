"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { generateWhatsAppURL } from "@/lib/whatsapp";
import IconSets from "@/components/IconSets";
import { X } from "lucide-react";

export function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = async () => {
    const message = `Hi! I'd like to know more about your menu and place an order. Thank you!`;
    const whatsappURL = await generateWhatsAppURL(message);
    window.open(whatsappURL ?? "", "_blank");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4 p-4 bg-background border rounded-2xl shadow-lg max-w-xs"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm">Need help?</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Chat with us on WhatsApp for quick orders and support!
            </p>
            <Button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
            >
              Start Chat
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-green-200 hover:bg-green-800 rounded-full shadow-lg flex items-center justify-center text-white transition-colors duration-300"
      >
        <IconSets name="whatsapp-logo" className="w-11 h-11" />
      </motion.button>
    </div>
  );
}
