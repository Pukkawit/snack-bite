"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import Image from "next/image";
import { Save, X, Upload } from "lucide-react";
import { useProfile } from "@/hooks/db/getUserProfile";

type Profile = {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  avatar_storage_path?: string | null;
};

export function ProfileForm() {
  const [formData, setFormData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const { handleProfileUpdate } = useProfile();
  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data, error } = await supabase
        .from("snack_bite_profile")
        .select("id, full_name,  avatar_url, avatar_storage_path")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setFormData(data as Profile);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    // ✅ Validate file size (e.g., 2MB max)
    const MAX_SIZE_MB = 2;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max size is ${MAX_SIZE_MB}MB`);
      return;
    }

    // ✅ Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar-${Date.now()}.${ext ?? "png"}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      /* SIGNED URL */
      const { data: signedUrlData } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

      const signedUrl = signedUrlData?.signedUrl;

      setFormData((prev) =>
        prev
          ? { ...prev, avatar_url: signedUrl, avatar_storage_path: filePath }
          : prev
      );

      /* PUBLIC URL */
      /*  const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl; */

      /* PUBLIC URL */
      /* setFormData((prev) =>
        prev
          ? { ...prev, avatar_url: publicUrl, avatar_storage_path: filePath }
          : prev
      ); */
      toast.success("Avatar uploaded");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      const { error } = await supabase
        .from("snack_bite_profile")
        .update({
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          avatar_storage_path: formData.avatar_storage_path,
        })
        .eq("id", formData.id);

      handleProfileUpdate();
      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading || !formData) {
    return <p className="text-center py-8">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <Separator className="mb-6" />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                {formData.avatar_url ? (
                  <Image
                    src={formData.avatar_url}
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="rounded-full object-cover w-20 h-20 object-center"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                    {formData.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}

                {/* ✅ Button triggers input click */}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload(e.target.files?.[0] ?? null)
                  }
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    document.getElementById("avatar-upload")?.click()
                  }
                  variant={uploading ? "outline" : "secondary"}
                  className="gap-2"
                >
                  <Upload size={16} />
                  {uploading ? "Uploading..." : "Change Avatar"}
                </Button>
              </div>

              <Input
                placeholder="Full Name *"
                value={formData.full_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadProfile}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
