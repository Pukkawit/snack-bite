"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { useEffect } from "react";
/* import { supabase } from "@/lib/supabase/client";
import { fetchTenantIdBySlug } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query"; */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
/* import toast from "react-hot-toast"; */
import { useMemo } from "react";
import { GoogleMapsInput } from "../google-maps-input";
import MediaUploader from "../MediaUploader";
import { DeleteButton } from "../DeleteButton";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Separator } from "../ui/separator";
import PhoneField from "../ui/PhoneField";
import { useRestaurantInfoMutations } from "@/hooks/db/useRestaurantInfoMutations";
import { useRestaurantInfo } from "@/hooks/db/useRestaurantInfo";

// ---------------- Zod schema ----------------
const sectionText = z.string().transform((v) => (v?.trim() ? v : undefined));

// file tag schema (optional on files)
const fileTag = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string().optional(),
});

// single file schema (shape your MediaUploader uses)
const fileSchema = z.object({
  questionId: z.string().optional(),
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  type: z.string().optional(),
  size: z.number().optional(),
  tags: z.array(fileTag).optional(),
  publicId: z.string().optional(),
  path: z.string().optional(),
  title: z.string().optional(),
  status: z.literal("removing").optional(),
  source: z.enum(["cloudinary", "supabase", "link"]).optional(),
});

// array of files with a default empty array
const fileArraySchema = z.array(fileSchema).default([]);

// paragraphs array default to empty array (so useFieldArray won't complain)
const strArray = z
  .array(z.string().transform((v) => (v?.trim() ? v : undefined)))
  .default([]);

// full form schema
const restaurantInfoSchema = z.object({
  hero_section: z.object({
    tagline: z.string().min(1, "Tagline is required"),
    description: z.string().min(1, "Description is required"),
    imageUrls: fileArraySchema,
  }),

  // about_section optional for flexibility, but defaultValues will provide it
  about_section: z.object({
    title: sectionText,
    description: sectionText,
    subtitle: sectionText.optional(),
    established: sectionText.optional(),
    happy_customers: sectionText.optional(),
    paragraphs: strArray.optional(),
    imageUrls: fileArraySchema.optional(),
  }),
  menu_section: z
    .object({
      title: sectionText,
      description: sectionText,
    })
    .optional(),
  google_maps_embed: sectionText,
  whatsapp: sectionText,
  address: sectionText,
  phone: sectionText,
  // Accept a JSON string in the form and parse it on submit
  additional_json: z.string().optional(),
});

export type RestaurantInfoFormValues = z.infer<typeof restaurantInfoSchema>;

// ---------------- Component ----------------
export function RestaurantInfoForm() {
  /* const queryClient = useQueryClient(); */
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  // typed default values to match the Zod schema shape
  const defaultValues: RestaurantInfoFormValues = {
    hero_section: {
      tagline: "",
      description: "",
      imageUrls: [],
    },
    about_section: {
      title: "",
      subtitle: "",
      description: "",
      established: "",
      happy_customers: "",
      paragraphs: [],
      imageUrls: [],
    },
    menu_section: {
      title: "",
      description: "",
    },
    google_maps_embed: "",
    whatsapp: "",
    address: "",
    phone: "",
    additional_json: "{\n  \n}",
  };

  // cast the resolver to avoid cross-package resolver type mismatches
  const resolver = zodResolver(
    restaurantInfoSchema
  ) as unknown as Resolver<RestaurantInfoFormValues>;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<RestaurantInfoFormValues>({
    resolver,
    defaultValues,
  });

  // watch typed fields (cast to the inferred types)
  const heroImages = watch("hero_section.imageUrls") || [];
  const aboutImages = watch("about_section.imageUrls") || [];

  const paragraphs = watch("about_section.paragraphs") || [];

  const addParagraph = () => {
    setValue("about_section.paragraphs", [...paragraphs, ""]);
  };

  const removeParagraph = (index: number) => {
    setValue(
      "about_section.paragraphs",
      paragraphs.filter((_, i) => i !== index)
    );
  };

  // Small helpers
  /*   const cleanArray = (arr?: (string | undefined)[]) =>
    (arr ?? []).map((s) => (s ?? "").trim()).filter(Boolean);

  const parseAdditional = (jsonStr?: string) => {
    if (!jsonStr || !jsonStr.trim()) return null;
    try {
      return JSON.parse(jsonStr);
    } catch {
      return "__INVALID__";
    }
  }; */

  const { data, isLoading } = useRestaurantInfo(tenantSlug);

  // ---------------- Mutation (UPSERT) since only one row per tenant is expected ----------------
  const { upsert } = useRestaurantInfoMutations(tenantSlug);
  /* const mutation = useMutation({
    mutationFn: async (values: RestaurantInfoFormValues) => {
      const tenantId = await fetchTenantIdBySlug(tenantSlug);

      const additionalParsed = parseAdditional(values.additional_json);
      if (additionalParsed === "__INVALID__") {
        throw new Error("Invalid JSON in Additional field");
      }

      // Build payload matching DB columns
      const payload = {
        tenant_id: tenantId,
        hero_section: {
          tagline: values.hero_section.tagline,
          description: values.hero_section.description,
          imageUrls: values.hero_section.imageUrls,
        },
        about_section: values.about_section
          ? {
              title: values.about_section.title || undefined,
              subtitle: values.about_section.subtitle || undefined,
              description: values.about_section.description || undefined,
              established: values.about_section.established || undefined,
              happy_customers:
                values.about_section.happy_customers || undefined,
              paragraphs: cleanArray(values.about_section.paragraphs),
              imageUrls: values.about_section.imageUrls,
            }
          : undefined,
        menu_section: values.menu_section
          ? {
              title: values.menu_section.title || undefined,
              description: values.menu_section.description || undefined,
            }
          : undefined,
        google_maps_embed: values.google_maps_embed || null,
        whatsapp: values.whatsapp || null,
        address: values.address || null,
        phone: values.phone || null,
        additional: additionalParsed ?? null,
      };

      const { error } = await supabase
        .from("snack_bite_restaurant_info")
        .insert([payload]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Restaurant info saved!");
      queryClient.invalidateQueries({
        queryKey: ["restaurant-info", tenantSlug],
      });
      reset(defaultValues);
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to save restaurant info");
    },
  }); */

  const onSubmit = (data: RestaurantInfoFormValues) => {
    upsert.mutate(data);
  };

  useEffect(() => {
    if (data) {
      reset({
        hero_section: {
          tagline: data.hero_section?.tagline ?? "",
          description: data.hero_section?.description ?? "",
          // convert string[] from DB back to file objects for MediaUploader
          imageUrls: (data.hero_section?.imageUrls ?? []).map(
            (url: string) => ({
              id: url,
              name: url.split("/").pop() ?? "image",
              url,
            })
          ),
        },
        about_section: {
          title: data.about_section?.title ?? "",
          subtitle: data.about_section?.subtitle ?? "",
          description: data.about_section?.description ?? "",
          established: data.about_section?.established ?? "",
          happy_customers: data.about_section?.happy_customers ?? "",
          paragraphs: data.about_section?.paragraphs ?? [],
          imageUrls: (data.about_section?.imageUrls ?? []).map(
            (url: string) => ({
              id: url,
              name: url.split("/").pop() ?? "image",
              url,
            })
          ),
        },
        menu_section: {
          title: data.menu_section?.title ?? "",
          description: data.menu_section?.description ?? "",
        },
        google_maps_embed: data.google_maps_embed ?? "",
        whatsapp: data.whatsapp ?? "",
        address: data.address ?? "",
        phone: data.phone ?? "",
        additional_json: data.additional
          ? JSON.stringify(data.additional, null, 2)
          : "{}",
      });
    }
  }, [data, reset]);

  // Section wrapper
  const Section = useMemo(
    () =>
      function Section({
        title,
        children,
      }: {
        title: string;
        children: React.ReactNode;
      }) {
        return (
          <div className="rounded-2xl border border-border p-4 md:p-6 space-y-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            {children}
          </div>
        );
      },
    []
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* HERO SECTION */}
      <Section title="Hero Section">
        <div>
          <Input
            {...register("hero_section.tagline")}
            placeholder="Best Bites in Town"
            required
            label="Tagline"
          />
          {errors.hero_section?.tagline && (
            <p className="text-red-500 text-sm">
              {errors.hero_section.tagline.message}
            </p>
          )}
        </div>
        <div>
          <Textarea
            label="Description"
            required
            id="hero_section.description"
            {...register("hero_section.description")}
            placeholder="Short hero description..."
          />
          {errors.hero_section?.description && (
            <p className="text-red-500 text-sm">
              {errors.hero_section.description.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <MediaUploader
            label="Hero Images"
            folder={`snack-bite/${tenantSlug}/hero-images`}
            accept="image/*"
            maxFiles={3}
            value={heroImages}
            onUpload={(files) =>
              // setValue typed to accept the file objects defined in fileSchema
              setValue("hero_section.imageUrls", files, {
                shouldValidate: true,
              })
            }
            cloudinaryOptions={{
              cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
              uploadPreset:
                process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
            }}
            info={
              heroImages && heroImages?.length < 3 ? (
                <p className="text-warning text-xs">
                  Please upload at least 3 images to continue.
                </p>
              ) : null
            }
            error={errors.hero_section?.imageUrls?.message || ""}
          />
        </div>
      </Section>

      {/* ABOUT SECTION */}
      <Section title="About Section">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Input
              {...register("about_section.title")}
              placeholder="About Snack Bite"
              label="Title"
              id="about_section.title"
            />
          </div>
          <div>
            <Input
              {...register("about_section.subtitle")}
              placeholder="Our Story"
              label="Subtitle"
              id="about_section.subtitle"
            />
          </div>
        </div>

        <div>
          <Textarea
            {...register("about_section.description")}
            id="about_section.description"
            placeholder="Longer about description..."
            label="Description"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Established"
              {...register("about_section.established")}
              id="about_section.established"
              placeholder="2014"
            />
          </div>
          <div>
            <Input
              label="Happy Customers"
              {...register("about_section.happy_customers")}
              placeholder="10,000+"
            />
          </div>
        </div>

        <div className="space-y-3 border p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Paragraph(s)</label>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={addParagraph}
            >
              Add Paragraph
            </Button>
          </div>
          <Separator />
          {paragraphs.map((value, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="flex-grow min-w-0">
                <Textarea
                  {...register(`about_section.paragraphs.${idx}` as const)}
                  placeholder={`Paragraph ${idx + 1}`}
                />
              </div>
              <div className="flex shrink-0">
                <DeleteButton
                  onClick={() => removeParagraph(idx)}
                  size="icon"
                  soundEnabled={true}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <MediaUploader
            label="About Images"
            folder={`snack-bite/${tenantSlug}/about-images`}
            accept="image/*"
            maxFiles={4}
            value={aboutImages}
            onUpload={(files) =>
              setValue("about_section.imageUrls", files, {
                shouldValidate: true,
              })
            }
            cloudinaryOptions={{
              cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
              uploadPreset:
                process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
            }}
            info={
              aboutImages && aboutImages?.length < 4 ? (
                <p className="text-warning text-xs">
                  Please upload 4 images to continue.
                </p>
              ) : null
            }
            error={errors.about_section?.imageUrls?.message || ""}
          />
        </div>
      </Section>

      {/* MENU SECTION */}
      <Section title="Menu Section">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input {...register("menu_section.title")} placeholder="Our Menu" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              {...register("menu_section.description")}
              placeholder="Tasty, fresh, and fast"
            />
          </div>
        </div>
      </Section>

      {/* CONTACT + MAP */}
      <Section title="Contact & Map">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <PhoneField
              label="Phone"
              {...register("phone")}
              placeholder="8000000000"
              formatOptions={{ whatsapp: false, call: true }}
              showFormatButtons={false}
            />
          </div>
          <div>
            <PhoneField
              label="WhatsApp"
              {...register("whatsapp")}
              placeholder="8000000000"
              formatOptions={{ whatsapp: true, call: false }}
              showFormatButtons={false}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <Input {...register("address")} placeholder="123 Main Street" />
        </div>
        <div>
          <Controller
            name="google_maps_embed"
            control={control}
            render={({ field, fieldState }) => (
              <GoogleMapsInput
                {...field}
                label="Google Maps Embed URL"
                instruction={
                  <Link
                    href="https://api.whatsapp.com/send/?phone=2348136289052&text=Hi+Pukkawit%21+I+would+like+my+business+to+appear+on+google+search+result.%20Kindly+assist+me+to+register+my+business+on+Google+Business+Profile.&type=phone_number&app_absent=0"
                    target="_blank"
                  >
                    Register your Business on Google Business Profile
                  </Link>
                }
                tooltip={{
                  message: (
                    <p>
                      If you would like your business location to be on the map
                      (if not yet) and appear on google search result, click{" "}
                      <Link
                        href="https://api.whatsapp.com/send/?phone=2348136289052&text=Hi+Pukkawit%21+I+would+like+my+business+to+appear+on+google+search+result.%20Kindly+assist+me+to+register+my+business+on+Google+Business+Profile.&type=phone_number&app_absent=0"
                        target="_blank"
                        className="underline text-primary uppercase font-semibold"
                      >
                        here
                      </Link>{" "}
                      to get started
                    </p>
                  ),
                }}
                error={fieldState.error?.message}
                placeholder="Enter your location, e.g. Itu Road, Uyo, Akwa Ibom State"
                className="w-full"
              />
            )}
          />
        </div>
      </Section>

      {/* ADDITIONAL JSON */}
      <Section title="Additional (JSON)">
        <Textarea
          {...register("additional_json")}
          rows={6}
          placeholder='{"theme":"warm","social":{"instagram":"https://..."}}'
        />
      </Section>

      <Button type="submit" disabled={upsert.isPending} className="w-full">
        {upsert.isPending ? "Saving..." : "Save Restaurant Info"}
      </Button>
    </form>
  );
}
