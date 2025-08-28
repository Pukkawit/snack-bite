"use client";

import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<{
    email: string;
    password: string;
    full_name: string;
  }>();

  const onSubmit = async (data: {
    email: string;
    password: string;
    full_name: string;
  }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-80">
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
        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
    </div>
  );
}
