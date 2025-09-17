"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  Camera,
  Settings,
  Users,
  BarChart3,
  Shield,
  Database,
  Bell,
  CreditCard,
  Globe,
  Settings2,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Basic Settings",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}`,
    icon: Settings,
    color: "text-violet-500",
  },
  {
    title: "Settings Box",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings`,
    icon: Settings2,
    color: "text-blue-500",
  },
  {
    title: "Tenant Management",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/tenants`,
    icon: Building2,
    color: "text-green-500",
  },
  {
    title: "User Management",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/users`,
    icon: Users,
    color: "text-purple-500",
  },
  {
    title: "Screenshots Upload",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/screenshots-upload`,
    icon: Camera,
    color: "text-orange-500",
  },
  {
    title: "Analytics & Reports",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/analytics`,
    icon: BarChart3,
    color: "text-indigo-500",
  },
  {
    title: "Security Settings",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/security`,
    icon: Shield,
    color: "text-red-500",
  },
  {
    title: "Database Management",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/database`,
    icon: Database,
    color: "text-teal-500",
  },
  {
    title: "Notifications",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/notifications`,
    icon: Bell,
    color: "text-yellow-500",
  },
  {
    title: "Billing & Plans",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/billing`,
    icon: CreditCard,
    color: "text-pink-500",
  },
  {
    title: "Global Settings",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/global`,
    icon: Globe,
    color: "text-cyan-500",
  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:bg-background md:border-r md:border-border md:pt-[88px]">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">SB</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Super Admin
              </h2>
              <p className="text-xs text-muted-foreground">
                SnackBite Platform
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-primary-foreground" : item.color
                  )}
                />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 px-4 py-4 border-t border-border">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">SA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Super Admin
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Platform Manager
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
