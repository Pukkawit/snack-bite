"use client";

import OpeningHoursForm from "@/components/admin/opening-hours-form";
import { ProfileForm } from "@/components/admin/profile-form";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";

import {
  FolderClock,
  UserCircle2,
  Gem,
  BookOpenCheck,
  Logs,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPage() {
  const [profileForm, setProfileForm] = useState(false);
  const [openingHoursForm, setOpeningHoursForm] = useState<boolean>(false);
  const router = useRouter();
  const params = useParams<{ tenantSlug: string }>();

  return (
    <div className="container mx-auto w-full flex-1 flex justify-center items-center">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <Dialog open={profileForm} onOpenChange={setProfileForm}>
          <DialogTrigger asChild>
            <div className="border-border cursor-pointer transition-colors duration-300 hover:bg-blue-400 dark:hover-bg-blue-400 bg-blue-500 dark:blue-300 rounded-md p-6 h-32 w-32 flex items-center justify-center">
              <div className="flex flex-col gap-2 items-center text-center">
                <UserCircle2 size={48} />
                <p className="text-sm leading-tight">Profile</p>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogTitle>Profile Settings</DialogTitle>
            <ProfileForm />
          </DialogContent>
        </Dialog>

        <div
          onClick={() => {
            router.push(`/admin/${params.tenantSlug}/menu-items-form`);
          }}
          className="border-border cursor-pointer bg-orange-500 dark:orange-300 transition-colors duration-300 hover:bg-orange-400 dark:hover-bg-orange-400 rounded-md p-6 h-32 w-32 flex items-center justify-center"
        >
          <div className="flex flex-col gap-2 items-center text-center">
            <Logs size={48} />
            <p className="text-sm leading-tight">Menu Items</p>
          </div>
        </div>

        <Dialog open={openingHoursForm} onOpenChange={setOpeningHoursForm}>
          <DialogTrigger asChild>
            <div className="border-border cursor-pointer bg-green-500 dark:green-300 transition-colors duration-300 hover:bg-green-400 dark:hover-bg-green-400 rounded-md p-6 h-32 w-32 flex items-center justify-center">
              <div className="flex flex-col gap-2 items-center text-center">
                <FolderClock size={48} />
                <p className="text-sm leading-tight">Opening Hours</p>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogTitle>Opening Hours Settings</DialogTitle>
            <OpeningHoursForm />
          </DialogContent>
        </Dialog>

        <div
          onClick={() => {
            router.push("");
          }}
          className="border-border cursor-pointer bg-yellow-500 dark:yellow-300 transition-colors duration-300 hover:bg-yellow-400 dark:hover-bg-yellow-400 rounded-md p-6 h-32 w-32 flex items-center justify-center"
        >
          <div className="flex flex-col gap-2 items-center text-center">
            <Gem size={48} />
            <p className="text-sm leading-tight">Promo Banners</p>
          </div>
        </div>

        <div
          onClick={() => {
            router.push(`/admin/${params.tenantSlug}/restaurant-info-form`);
          }}
          className="border-border cursor-pointer transition-colors duration-300 hover:bg-purple-400 dark:hover-bg-purple-400 bg-purple-500 dark:purple-300 rounded-md p-6 h-32 w-32 flex items-center justify-center"
        >
          <div className="flex flex-col gap-2 items-center text-center">
            <BookOpenCheck size={48} />
            <p className="text-sm leading-tight">Restaurant Info</p>
          </div>
        </div>
      </div>
    </div>
  );
}
