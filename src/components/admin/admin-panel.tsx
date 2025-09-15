"use client";

import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRestaurantName } from "@/hooks/db/getRestaurantName";
import toast from "react-hot-toast";
import { useProfile } from "@/hooks/db/getUserProfile";
import { getInitials } from "@/lib/utils";
import { useParams } from "next/navigation";

export function AdminPanel() {
  const router = useRouter();

  const params = useParams();
  const tenantSlug = params.tenantSlug as string | undefined;

  const { profile, isLoading } = useProfile();

  const { data: restaurantName } = useRestaurantName(tenantSlug ?? "SnackBite");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/auth/login");
  };

  if (isLoading) {
    return (
      <div className="bg-muted/50 py-4 shadow-sm mb-4">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
            <h1 className="text-2xl font-bold">Loading…</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted py-4 z-50 shadow-sm mb-4">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name ?? "Avatar"}
                width={48}
                height={48}
                className="rounded-full object-cover w-14 h-14 object-center"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted-foreground/50 text-2xl flex items-center justify-center font-semibold text-primary">
                {getInitials(profile?.full_name)}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold">{restaurantName}</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.full_name ?? "Admin"}
              </p>
            </div>
          </div>

          <Button onClick={handleSignOut} variant="destructive" size="sm">
            <span className="flex items-center gap-2">
              <LogOut size={14} /> Sign Out
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
