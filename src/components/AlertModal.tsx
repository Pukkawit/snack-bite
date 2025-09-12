"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  TriangleAlert,
  CheckCircle,
  Info,
  AlertCircle,
  X,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";

export type AlertVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "gradient"
  | "glass"
  | "neon";

export type AlertSize = "sm" | "md" | "lg";

export interface IAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string | ReactNode;
  alertType: AlertVariant;
  title: string;
  buttonText?: string;
  size?: AlertSize;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  animate?: boolean;
  autoClose?: number; // Auto close after X milliseconds
  customIcon?: ReactNode;
}

const AlertModal = ({
  isOpen,
  onClose,
  message,
  alertType,
  title = "Alert",
  buttonText = "OK",
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
  animate = true,
  autoClose,
  customIcon,
}: IAlertModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(100);

  // Variant configurations with comprehensive dark mode support
  const variantConfig = {
    success: {
      backdrop: "bg-emerald-900/40 dark:bg-emerald-950/60 backdrop-blur-sm",
      container: `
        bg-white/95 backdrop-blur-md border border-emerald-200/50 shadow-2xl shadow-emerald-500/20
        dark:bg-emerald-950/90 dark:border-emerald-700/50 dark:shadow-emerald-900/40
      `,
      header: `
        bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 
        dark:from-emerald-600 dark:via-green-600 dark:to-emerald-700
      `,
      headerText: "text-white",
      body: `
        bg-gradient-to-br from-emerald-50/80 to-green-50/60 
        dark:from-emerald-900/50 dark:to-green-900/30
      `,
      bodyText: "text-emerald-800 dark:text-emerald-200",
      footer: `
        bg-emerald-50/60 border-t border-emerald-200/50 
        dark:bg-emerald-900/30 dark:border-emerald-700/30
      `,
      button: `
        bg-gradient-to-r from-emerald-500 to-green-500 text-white 
        hover:from-emerald-600 hover:to-green-600 
        focus:ring-emerald-500 shadow-lg shadow-emerald-500/30
        dark:shadow-emerald-400/20
      `,
      icon: <CheckCircle className="w-6 h-6 text-white" />,
      iconBg: "bg-white/20 dark:bg-white/10",
      pulse: "animate-pulse",
    },
    error: {
      backdrop: "bg-red-900/40 dark:bg-red-950/60 backdrop-blur-sm",
      container: `
        bg-white/95 backdrop-blur-md border border-red-200/50 shadow-2xl shadow-red-500/20
        dark:bg-red-950/90 dark:border-red-700/50 dark:shadow-red-900/40
      `,
      header: `
        bg-gradient-to-r from-red-500 via-rose-500 to-red-600 
        dark:from-red-600 dark:via-rose-600 dark:to-red-700
      `,
      headerText: "text-white",
      body: `
        bg-gradient-to-br from-red-50/80 to-rose-50/60 
        dark:from-red-900/50 dark:to-rose-900/30
      `,
      bodyText: "text-red-800 dark:text-red-200",
      footer: `
        bg-red-50/60 border-t border-red-200/50 
        dark:bg-red-900/30 dark:border-red-700/30
      `,
      button: `
        bg-gradient-to-r from-red-500 to-rose-500 text-white 
        hover:from-red-600 hover:to-rose-600 
        focus:ring-red-500 shadow-lg shadow-red-500/30
        dark:shadow-red-400/20
      `,
      icon: <TriangleAlert className="w-6 h-6 text-white" />,
      iconBg: "bg-white/20 dark:bg-white/10",
      pulse: "animate-bounce",
    },
    warning: {
      backdrop: "bg-amber-900/40 dark:bg-amber-950/60 backdrop-blur-sm",
      container: `
        bg-white/95 backdrop-blur-md border border-amber-200/50 shadow-2xl shadow-amber-500/20
        dark:bg-amber-950/90 dark:border-amber-700/50 dark:shadow-amber-900/40
      `,
      header: `
        bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 
        dark:from-amber-600 dark:via-yellow-600 dark:to-amber-700
      `,
      headerText: "text-white",
      body: `
        bg-gradient-to-br from-amber-50/80 to-yellow-50/60 
        dark:from-amber-900/50 dark:to-yellow-900/30
      `,
      bodyText: "text-amber-800 dark:text-amber-200",
      footer: `
        bg-amber-50/60 border-t border-amber-200/50 
        dark:bg-amber-900/30 dark:border-amber-700/30
      `,
      button: `
        bg-gradient-to-r from-amber-500 to-yellow-500 text-white 
        hover:from-amber-600 hover:to-yellow-600 
        focus:ring-amber-500 shadow-lg shadow-amber-500/30
        dark:shadow-amber-400/20
      `,
      icon: <AlertCircle className="w-6 h-6 text-white" />,
      iconBg: "bg-white/20 dark:bg-white/10",
      pulse: "animate-pulse",
    },
    info: {
      backdrop: "bg-blue-900/40 dark:bg-blue-950/60 backdrop-blur-sm",
      container: `
        bg-white/95 backdrop-blur-md border border-blue-200/50 shadow-2xl shadow-blue-500/20
        dark:bg-blue-950/90 dark:border-blue-700/50 dark:shadow-blue-900/40
      `,
      header: `
        bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 
        dark:from-blue-600 dark:via-cyan-600 dark:to-blue-700
      `,
      headerText: "text-white",
      body: `
        bg-gradient-to-br from-blue-50/80 to-cyan-50/60 
        dark:from-blue-900/50 dark:to-cyan-900/30
      `,
      bodyText: "text-blue-800 dark:text-blue-200",
      footer: `
        bg-blue-50/60 border-t border-blue-200/50 
        dark:bg-blue-900/30 dark:border-blue-700/30
      `,
      button: `
        bg-gradient-to-r from-blue-500 to-cyan-500 text-white 
        hover:from-blue-600 hover:to-cyan-600 
        focus:ring-blue-500 shadow-lg shadow-blue-500/30
        dark:shadow-blue-400/20
      `,
      icon: <Info className="w-6 h-6 text-white" />,
      iconBg: "bg-white/20 dark:bg-white/10",
      pulse: "animate-pulse",
    },
    gradient: {
      backdrop: `
        bg-gradient-to-br from-purple-900/50 via-pink-900/40 to-indigo-900/50 
        dark:from-purple-950/70 dark:via-pink-950/60 dark:to-indigo-950/70 
        backdrop-blur-sm
      `,
      container: `
        bg-gradient-to-br from-white/20 via-purple-50/30 to-pink-50/20 
        backdrop-blur-xl border border-white/30 shadow-2xl shadow-purple-500/30
        dark:from-purple-900/30 dark:via-pink-900/20 dark:to-indigo-900/30 
        dark:border-white/10 dark:shadow-purple-400/20
      `,
      header: `
        bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 
        dark:from-purple-700 dark:via-pink-700 dark:to-indigo-700
      `,
      headerText: "text-white",
      body: `
        bg-gradient-to-br from-white/10 via-purple-50/20 to-pink-50/10 
        dark:from-purple-900/20 dark:via-pink-900/10 dark:to-indigo-900/20
      `,
      bodyText: "text-purple-900 dark:text-purple-200",
      footer: `
        bg-white/5 border-t border-white/20 
        dark:bg-white/5 dark:border-white/10
      `,
      button: `
        bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white 
        hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 
        focus:ring-purple-500 shadow-lg shadow-purple-500/40
        dark:shadow-purple-400/30
      `,
      icon: <Sparkles className="w-6 h-6 text-white" />,
      iconBg: "bg-white/20 dark:bg-white/10",
      pulse: "animate-pulse",
    },
    glass: {
      backdrop: "bg-slate-900/60 dark:bg-black/80 backdrop-blur-md",
      container: `
        bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl 
        dark:bg-white/5 dark:border-white/10
      `,
      header: `
        bg-white/10 border-b border-white/20 
        dark:bg-white/5 dark:border-white/10
      `,
      headerText: "text-white",
      body: `
        bg-white/5 
        dark:bg-white/5
      `,
      bodyText: "text-white/90 dark:text-white/80",
      footer: `
        bg-white/5 border-t border-white/10 
        dark:bg-white/5 dark:border-white/10
      `,
      button: `
        bg-white/20 text-white border border-white/30 
        hover:bg-white/30 hover:border-white/40 
        focus:ring-white/50 backdrop-blur-sm
      `,
      icon: <Shield className="w-6 h-6 text-white" />,
      iconBg: "bg-white/10 dark:bg-white/10",
      pulse: "animate-pulse",
    },
    neon: {
      backdrop: "bg-black/80 backdrop-blur-sm",
      container: `
        bg-black/90 backdrop-blur-md border border-cyan-400/50 shadow-2xl 
        shadow-cyan-400/50 dark:border-cyan-300/50 dark:shadow-cyan-300/50
      `,
      header: `
        bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-cyan-400/30
        dark:border-cyan-300/30
      `,
      headerText: "text-cyan-300 dark:text-cyan-200",
      body: `
        bg-black/50 
        dark:bg-black/70
      `,
      bodyText: "text-cyan-100 dark:text-cyan-50",
      footer: `
        bg-black/30 border-t border-cyan-400/20 
        dark:border-cyan-300/20
      `,
      button: `
        bg-gradient-to-r from-cyan-500 to-purple-500 text-white 
        hover:from-cyan-400 hover:to-purple-400 
        focus:ring-cyan-400 shadow-lg shadow-cyan-400/50
        border border-cyan-400/50 dark:border-cyan-300/50
      `,
      icon: <Zap className="w-6 h-6 text-cyan-300 dark:text-cyan-200" />,
      iconBg: "bg-cyan-500/20 dark:bg-cyan-400/20",
      pulse: "animate-pulse",
    },
  };

  // Size configurations
  const sizeConfig = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  const config = variantConfig[alertType];

  const handleClose = useCallback(() => {
    if (animate) {
      setIsAnimating(true);
      setTimeout(onClose, 200);
    } else {
      onClose();
    }
  }, [animate, onClose]);

  // Auto close functionality
  useEffect(() => {
    if (isOpen && autoClose) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (autoClose / 100);
          if (newProgress <= 0) {
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isOpen, autoClose, handleClose]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeOnBackdrop &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, closeOnBackdrop, handleClose]);

  // Animation handler
  useEffect(() => {
    if (isOpen && animate) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, animate]);

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 flex items-center justify-center z-50 p-4 
        ${config.backdrop}
        ${animate ? `transition-all duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}` : ""}
      `}
    >
      <div
        ref={modalRef}
        className={`
          ${config.container} 
          ${sizeConfig[size]} 
          w-full 
          rounded-2xl 
          overflow-hidden
          ${
            animate
              ? `transform transition-all duration-300 ease-out ${
                  isAnimating
                    ? "scale-90 opacity-0 -translate-y-4"
                    : "scale-100 opacity-100 translate-y-0"
                }`
              : ""
          }
        `}
      >
        {/* Auto-close progress bar */}
        {autoClose && (
          <div className="h-1 bg-black/10 dark:bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-white/50 to-white/30 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Header */}
        <div
          className={`${config.header} px-6 py-4 flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`${config.iconBg} p-2.5 rounded-full ${config.pulse}`}
            >
              {customIcon || config.icon}
            </div>
            <h3
              className={`text-lg font-bold ${config.headerText} tracking-wide`}
            >
              {title}
            </h3>
          </div>
          {showCloseButton && (
            <button
              onClick={handleClose}
              className={`
                p-2 rounded-full transition-all duration-200 
                hover:bg-white/20 dark:hover:bg-white/10 
                focus:outline-none focus:ring-2 focus:ring-white/50
                ${config.headerText}
              `}
              aria-label="Close alert"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className={`${config.body} px-6 py-6`}>
          <div
            className={`${config.bodyText} text-base leading-relaxed font-medium`}
          >
            {message}
          </div>
        </div>

        {/* Footer */}
        <div className={`${config.footer} px-6 py-4 flex justify-end`}>
          <button
            onClick={handleClose}
            className={`
              ${config.button}
              px-6 py-2.5 rounded-xl font-semibold text-sm
              transition-all duration-200 transform
              hover:scale-105 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

/* 

import React, { useState } from "react";
import AlertModal from "./AlertModal";

const ExampleComponent = () => {
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [type, setType] = useState<"success"|"error">("error");

  return (
    <div>
      <button
        onClick={() => setAlertOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Open Alert
      </button>

      <AlertModal
        title={type === "error" ? "Error Message!" : "Success Message!"}
        alertType={type}
        isOpen={isOpen}
        message={alertMessage}
        onClose={() => {
          setIsOpen(!isOpen);
        }}
      />
    </div>
  );
};

export default ExampleComponent;


*/
