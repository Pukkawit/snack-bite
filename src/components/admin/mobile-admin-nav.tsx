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
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const bottomNavItems = [
  {
    title: "General",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings`,
    icon: Settings,
  },
  {
    title: "Tenants",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/tenants`,
    icon: Building2,
  },
  {
    title: "Users",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/users`,
    icon: Users,
  },
  {
    title: "Analytics",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/analytics`,
    icon: BarChart3,
  },
];

const allNavItems = [
  {
    title: "General Settings",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/general`,
    icon: Settings,
  },
  {
    title: "Tenant Management",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/tenants`,
    icon: Building2,
  },
  {
    title: "User Management",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/users`,
    icon: Users,
  },
  {
    title: "Screenshots Upload",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/screenshots-upload`,
    icon: Camera,
  },
  {
    title: "Analytics & Reports",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/analytics`,
    icon: BarChart3,
  },
];

export function MobileAdminNav() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium truncate">
                  {item.title}
                </span>
              </Link>
            );
          })}

          {/* More Menu Drawer Trigger */}
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center justify-center p-2 rounded-lg min-w-0 flex-1"
              >
                <Menu className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SB</span>
                  </div>
                  <span>Super Admin Settings</span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-2">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">SA</span>
                  </div>
                  <div>
                    <p className="font-medium">Super Admin</p>
                    <p className="text-sm text-muted-foreground">
                      Platform Manager
                    </p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom padding to prevent content overlap */}
      <div className="md:hidden h-20" />
    </>
  );
}
