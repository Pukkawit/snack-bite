"use client";

import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import PasswordField from "../ui/PasswordField";

export default function Login() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { register, handleSubmit } = useForm<{
    email: string;
    password: string;
  }>();
  const router = useRouter();

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword(data);
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    console.log("USER ID", user?.id);

    // ✅ Fetch profile + tenant slug
    const { data: profile } = await supabase
      .from("snack_bite_profile")
      .select("tenant_id")
      .eq("id", user?.id)
      .single();

    if (!profile) {
      toast.error("Profile not found");
      setIsLoading(false);
      return;
    }

    const { data: tenant } = await supabase
      .from("snack_bite_tenants")
      .select("slug")
      .eq("id", profile.tenant_id)
      .single();

    if (!tenant) {
      toast.error("Tenant not found");
      return;
    }

    toast.success("Login successful");
    router.push(`/admin/${tenant.slug}`);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Welcome Back👋!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-muted-foreground text-center">
          Please login to your account to access the admin panel and manage your
          restaurant&apos;s storefront.
        </p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto my-8 space-y-6  border border-border p-4 w-full rounded-md "
        >
          <Input
            label="Email"
            required
            placeholder="Email"
            type="email"
            id="email"
            {...register("email", { required: true })}
          />
          <PasswordField
            label="Password"
            placeholder="Password"
            required
            id="password"
            {...register("password", { required: true })}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex gap-2 items-center">
                <Loader2 className="animate-spin" size={14} /> Logging in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <KeyRound size={14} /> Login
              </span>
            )}
          </Button>
        </form>
        <div className="flex items-center justify-center gap-1 text-sm">
          <p className="text-secondary-foreground">
            Don&apos;t have an acccount?
          </p>
          <Link
            href="/auth/register"
            className="text-sm underline text-secondary-disabled-foreground hover:text-primary transition-colors duration-300"
          >
            Register.
          </Link>
        </div>

        <Separator className="mt-4 mb-2" />

        <div className="flex items-center justify-center bg-muted/80 p-3 border-muted rounded-sm shadow-md">
          <p className="text-secondary-foreground/80 text-sm">
            Demo credentials: johnmauwa@gmail.com / admin123
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
