"use client";

import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { register, handleSubmit } = useForm<{
    email: string;
    password: string;
  }>();
  const router = useRouter();

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success("Welcome back!");
      router.push("/admin"); // redirect to admin panel
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-2">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Welcome Back👋!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground text-center">
            Please login to your account to access the admin panel and manage
            your restaurant&apos;s storefront.
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto my-8 space-y-6  border border-border p-4 w-full rounded-md "
          >
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
                  <Loader2 className="animate-spin" size={14} /> Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <KeyRound size={14} /> Login
                </span>
              )}
            </Button>
          </form>
          <div className="flex items-center justify-center bg-muted/50">
            <p className="text-muted-foreground text-sm">
              Demo credentials: johnmauwa@gmail.com / admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
