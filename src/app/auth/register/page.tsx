"use client";

import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Signature } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { register, handleSubmit, reset } = useForm<{
    email: string;
    password: string;
    full_name: string;
  }>();

  const onSubmit = async (data: {
    email: string;
    password: string;
    full_name: string;
  }) => {
    setIsLoading(true);
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }
    // Insert into profile
    if (authData.user) {
      await supabase.from("snack_bite_profile").insert({
        id: authData.user.id,
        full_name: data.full_name,
        role: "admin",
      });
    }

    toast.success("Registered successfully!");
    router.push("/auth/login");
    reset();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Welcome 🥰!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground text-center">
            Please signup to access the admin panel and manage your restaurant.
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto my-8 space-y-6  border border-border p-4 w-full rounded-md"
          >
            <Input
              placeholder="Full Name"
              {...register("full_name", { required: true })}
            />
            <Input
              placeholder="Email"
              type="email"
              {...register("email", { required: true })}
            />
            <Input
              placeholder="Password"
              type="password"
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
        </CardContent>
      </Card>
    </div>
  );
}
