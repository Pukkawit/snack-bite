"use client";

import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Signature } from "lucide-react";
import { getUniqueTenantSlug } from "@/lib/slugify";
import Link from "next/link";
import PasswordField from "../ui/PasswordField";

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { register, handleSubmit, reset } = useForm<{
    email: string;
    password: string;
    full_name: string;
    restaurant_name: string;
  }>();

  const onSubmit = async (data: {
    email: string;
    password: string;
    full_name: string;
    restaurant_name: string;
  }) => {
    setIsLoading(true);

    const slug = await getUniqueTenantSlug(data.restaurant_name);
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          tenant_slug: slug,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    try {
      if (!authData.user) {
        toast.error("Signup did not return a user.");
        setIsLoading(false);
        return;
      }

      // Just insert into tenant_owners now
      const { error: ownerError } = await supabase
        .from("snack_bite_tenant_owners")
        .insert({
          user_id: authData.user.id,
          full_name: data.full_name,
          restaurant_name: data.restaurant_name,
          slug,
        });

      if (ownerError) throw ownerError;

      toast.success("Registration successful! Please check your email.");
      reset();
      router.push("/auth/login");
    } catch (e: unknown) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Welcome to SnackBite🥰!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground text-center">
            Please register to create a restaurant storefront and access the
            admin panel and manage your restaurant.
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto my-8 space-y-6 border border-border p-4 w-full rounded-md"
          >
            <Input
              label="Full Name"
              id={"full_name"}
              required
              placeholder="e.g. John Mauwa"
              {...register("full_name", { required: true })}
            />
            <Input
              label="Restaurant's Name"
              id={"restaurant_name"}
              placeholder="e.g. Junal Eatery"
              required
              {...register("restaurant_name", { required: true })}
            />
            <Input
              label="Email"
              placeholder="e.g. johnmauwa@email.com"
              required
              id={"email"}
              type="email"
              {...register("email", { required: true })}
            />
            <PasswordField
              placeholder="Password"
              label="Password"
              required
              instruction="Enter a strong password"
              showPasswordStrength={true}
              id={"password"}
              {...register("password", { required: true })}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex gap-2 items-center">
                  <Loader2 className="animate-spin" size={14} /> Registering...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Signature size={14} /> Register
                </span>
              )}
            </Button>
          </form>
          <div className="flex items-center justify-center gap-1 text-sm">
            <p className="text-secondary-foreground">
              Have an acccount already?
            </p>
            <Link
              href="/auth/login"
              className="text-sm underline text-secondary-disabled-foreground hover:text-primary transition-colors duration-300"
            >
              Login.
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
