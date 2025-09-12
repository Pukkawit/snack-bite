"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  MessageCircle,
  Send,
  X,
  ChevronDown,
  Phone,
  ShoppingCart,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot" | "vendor";
  timestamp: Date;
  senderName?: string;
}

interface ChatbotWidgetProps {
  /** Whether the chatbot is initially open */
  isOpen?: boolean;
  /** Callback when chatbot open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Business name for branding */
  businessName?: string;
  /** Welcome message from the bot */
  welcomeMessage?: string;
  /** Vendor information */
  vendorInfo?: {
    name: string;
    isOnline: boolean;
    responseTime?: string;
  };
  /** Quick action buttons */
  quickActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    action: () => void;
  }>;
  /** Custom styling */
  className?: string;
}

export function ChatbotWidget({
  isOpen = false,
  onOpenChange,
  businessName = "Our Store",
  welcomeMessage = "Welcome, we are taking orders",
  vendorInfo = {
    name: "Francis",
    isOnline: true,
    responseTime: "Usually replies instantly",
  },
  quickActions = [],
  className,
}: ChatbotWidgetProps) {
  const [open, setOpen] = useState(isOpen);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: welcomeMessage,
      sender: "vendor",
      timestamp: new Date(),
      senderName: vendorInfo.name,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate bot response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! How can I help you with your order today?",
        sender: "vendor",
        timestamp: new Date(),
        senderName: vendorInfo.name,
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const defaultQuickActions = [
    {
      label: "Place Order",
      icon: <ShoppingCart className="w-4 h-4" />,
      action: () => {
        const orderMessage: Message = {
          id: Date.now().toString(),
          text: "I'd like to place an order",
          sender: "user",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, orderMessage]);
      },
    },
    {
      label: "Contact Support",
      icon: <Headphones className="w-4 h-4" />,
      action: () => {
        const supportMessage: Message = {
          id: Date.now().toString(),
          text: "I need help with my order",
          sender: "user",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, supportMessage]);
      },
    },
    {
      label: "Call Us",
      icon: <Phone className="w-4 h-4" />,
      action: () => window.open("tel:+1234567890", "_self"),
    },
  ];

  const actionsToShow =
    quickActions.length > 0 ? quickActions : defaultQuickActions;

  if (!open) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button
          onClick={() => handleOpenChange(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          style={{
            backgroundColor: "var(--chatbot-primary)",
            color: "var(--chatbot-primary-foreground)",
          }}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <Card
        className="w-80 h-96 flex flex-col shadow-2xl border-0 overflow-hidden"
        style={{
          animation: "chatbot-slide-up 0.3s ease-out",
          boxShadow: `0 20px 25px -5px var(--chatbot-shadow), 0 10px 10px -5px var(--chatbot-shadow)`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 text-white"
          style={{ backgroundColor: "var(--chatbot-primary)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Order on WhatsApp</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1 text-xs opacity-90">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>
                  {vendorInfo.name} •{" "}
                  {vendorInfo.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenChange(false)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
              style={{ animation: "message-slide-in 0.3s ease-out" }}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  message.sender === "user" ? "text-white" : "text-gray-800"
                )}
                style={{
                  backgroundColor:
                    message.sender === "user"
                      ? "var(--chatbot-primary)"
                      : "var(--chatbot-bot-bubble)",
                }}
              >
                {message.sender !== "user" && message.senderName && (
                  <div
                    className="text-xs font-semibold mb-1"
                    style={{ color: "var(--chatbot-primary)" }}
                  >
                    {message.senderName}
                  </div>
                )}
                <div>{message.text}</div>
                <div
                  className={cn(
                    "text-xs mt-1 opacity-70",
                    message.sender === "user" ? "text-right" : "text-left"
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div
                className="rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--chatbot-bot-bubble)" }}
              >
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    style={{ animation: "typing-dots 1.4s infinite" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    style={{ animation: "typing-dots 1.4s infinite 0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    style={{ animation: "typing-dots 1.4s infinite 0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {actionsToShow.length > 0 && (
          <div className="px-4 py-2 border-t bg-white">
            <div className="flex gap-2 overflow-x-auto">
              {actionsToShow.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="flex items-center gap-1 whitespace-nowrap text-xs bg-transparent"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write your message..."
              className="flex-1 border-gray-200 focus:border-emerald-500"
              style={{ backgroundColor: "var(--chatbot-input-bg)" }}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="px-3"
              style={{
                backgroundColor: "var(--chatbot-primary)",
                color: "var(--chatbot-primary-foreground)",
              }}
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Usage Examples:

/*
// Basic usage
<ChatbotWidget />

// With custom props
<ChatbotWidget
  businessName="Pizza Palace"
  welcomeMessage="Hi! Ready to order some delicious pizza?"
  vendorInfo={{
    name: "Mario",
    isOnline: true,
    responseTime: "Usually replies in 2 minutes"
  }}
  quickActions={[
    {
      label: "View Menu",
      icon: <Menu className="w-4 h-4" />,
      action: () => window.open("/menu", "_blank")
    },
    {
      label: "Track Order",
      icon: <MapPin className="w-4 h-4" />,
      action: () => window.open("/track", "_blank")
    }
  ]}
/>

// Controlled state
const [chatOpen, setChatOpen] = useState(false)
<ChatbotWidget
  isOpen={chatOpen}
  onOpenChange={setChatOpen}
  businessName="Tech Support"
  welcomeMessage="How can we help you today?"
/>

// E-commerce store
<ChatbotWidget
  businessName="Fashion Store"
  welcomeMessage="Welcome! Looking for something specific?"
  vendorInfo={{
    name: "Sarah",
    isOnline: true,
    responseTime: "Usually replies instantly"
  }}
  quickActions={[
    {
      label: "Browse Products",
      icon: <ShoppingBag className="w-4 h-4" />,
      action: () => router.push("/products")
    },
    {
      label: "Size Guide",
      icon: <Ruler className="w-4 h-4" />,
      action: () => window.open("/size-guide", "_blank")
    },
    {
      label: "Returns",
      icon: <RotateCcw className="w-4 h-4" />,
      action: () => window.open("/returns", "_blank")
    }
  ]}
/>

// Restaurant/Food delivery
<ChatbotWidget
  businessName="Burger House"
  welcomeMessage="Hungry? Let's get you fed!"
  vendorInfo={{
    name: "Chef Mike",
    isOnline: true,
    responseTime: "Usually replies in 1 minute"
  }}
  quickActions={[
    {
      label: "Order Now",
      icon: <UtensilsCrossed className="w-4 h-4" />,
      action: () => router.push("/order")
    },
    {
      label: "Call Restaurant",
      icon: <Phone className="w-4 h-4" />,
      action: () => window.open("tel:+1234567890", "_self")
    },
    {
      label: "Delivery Status",
      icon: <Truck className="w-4 h-4" />,
      action: () => router.push("/delivery-status")
    }
  ]}
/>

// Service business
<ChatbotWidget
  businessName="Home Cleaning Pro"
  welcomeMessage="Need cleaning services? We're here to help!"
  vendorInfo={{
    name: "Lisa",
    isOnline: true,
    responseTime: "Usually replies in 5 minutes"
  }}
  quickActions={[
    {
      label: "Book Service",
      icon: <Calendar className="w-4 h-4" />,
      action: () => router.push("/booking")
    },
    {
      label: "Get Quote",
      icon: <Calculator className="w-4 h-4" />,
      action: () => router.push("/quote")
    },
    {
      label: "Emergency Clean",
      icon: <Zap className="w-4 h-4" />,
      action: () => window.open("tel:+1234567890", "_self")
    }
  ]}
/>
*/
