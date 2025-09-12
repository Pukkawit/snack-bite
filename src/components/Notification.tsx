"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import IconSets from "@/components/IconSets";

// Define the types for the Notification props
type NotificationProps = {
  message: string;
  type: "success" | "error" | "warning" | "info";
  isVisible: boolean;
  onClose: () => void;
};

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 6000); // Auto-close after 5 seconds
      return () => clearTimeout(timer); // Cleanup timer on unmount or visibility change
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const typeStyles: Record<NotificationProps["type"], string> = {
    success: `bg-success/90 text-success-foreground border-2 border-success-foreground`,
    error: `bg-destructive text-destructive-foreground border-2 border-destructive-foreground`,
    warning: `bg-orange-400/40 text-white dark:bg-orange-600/40 border-2 border-orange-400 dark:border-orange-400 text-white`,
    info: `bg-blue-400/40 text-white dark:bg-blue-600/40 border-2 border-blue-400 dark:border-blue-400 text-white`,
  };

  const baseStyles = `fixed bottom-5 right-7 font-normal text-sm px-4 py-3 rounded-lg shadow-lg z-[100]`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: "spring", damping: 15, stiffness: 300 }}
      key={message}
      className={`${baseStyles} ${typeStyles[type]}`}
    >
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button
          type="button"
          title="close"
          onClick={onClose}
          className="ml-4 text-lg font-normal  hover:text--primary-hover"
        >
          <IconSets
            name="close"
            className="w-2 h-2 text-white hover:text-gray-200"
            aria-hidden="true"
            height={32}
            width={32}
          />
        </button>
      </div>
    </motion.div>
  );
};

export default Notification;
