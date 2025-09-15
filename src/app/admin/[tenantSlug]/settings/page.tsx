import Link from "next/link";
import { MobileAdminNav } from "@/components/admin/mobile-admin-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ArrowRight,
} from "lucide-react";

const settingsCards = [
  {
    title: "General Settings",
    description: "Configure basic platform settings and preferences",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/general`,
    icon: Settings,
    color: "bg-blue-500",
  },
  {
    title: "Tenant Management",
    description: "Manage restaurant tenants, subscriptions, and configurations",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/tenants`,
    icon: Building2,
    color: "bg-green-500",
  },
  {
    title: "User Management",
    description: "Manage platform users, roles, and permissions",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/users`,
    icon: Users,
    color: "bg-purple-500",
  },
  {
    title: "Screenshots Upload",
    description: "Upload and manage platform screenshots and media",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/screenshots-upload`,
    icon: Camera,
    color: "bg-orange-500",
  },
  {
    title: "Analytics & Reports",
    description: "View platform analytics, usage reports, and insights",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/analytics`,
    icon: BarChart3,
    color: "bg-indigo-500",
  },
  {
    title: "Security Settings",
    description:
      "Configure security policies, authentication, and access controls",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/security`,
    icon: Shield,
    color: "bg-red-500",
  },
  {
    title: "Database Management",
    description: "Manage database connections, backups, and maintenance",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/database`,
    icon: Database,
    color: "bg-teal-500",
  },
  {
    title: "Notifications",
    description: "Configure system notifications and alert preferences",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/notifications`,
    icon: Bell,
    color: "bg-yellow-500",
  },
  {
    title: "Billing & Plans",
    description: "Manage subscription plans, billing, and payment settings",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/billing`,
    icon: CreditCard,
    color: "bg-pink-500",
  },
  {
    title: "Global Settings",
    description: "Configure platform-wide settings and system preferences",
    href: `/admin/${process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG}/settings/global`,
    icon: Globe,
    color: "bg-cyan-500",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1">
        <div className="p-6 pb-24 md:pb-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Super Admin Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your SnackBite platform settings, tenants, and
              configurations
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsCards.map((setting) => {
              const Icon = setting.icon;

              return (
                <Card
                  key={setting.href}
                  className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 ${setting.color} rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {setting.title}
                        </CardTitle>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4">
                      {setting.description}
                    </CardDescription>
                    <Link href={setting.href}>
                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                      >
                        Configure
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-sm text-muted-foreground">
                      Active Tenants
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">98.5%</p>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">
                      Security Issues
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MobileAdminNav />
    </div>
  );
}
