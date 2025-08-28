"use client";

import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { register, handleSubmit } = useForm<{
    email: string;
    password: string;
  }>();
  const router = useRouter();

  const onSubmit = async (data: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      router.push("/admin"); // redirect to admin panel
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-80">
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
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>

      <div className="flex items-center justify-center bg-muted/50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Demo credentials: admin@snackbite.com / admin123
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
