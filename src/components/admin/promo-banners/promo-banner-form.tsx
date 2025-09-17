"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePromoBanners } from "@/hooks/db/usePromoBanners";
import ColorInput from "@/components/ui/ColorInput";
import { DatePicker } from "@/components/ui/DatePicker";
import { formatDate } from "date-fns";

const emptyForm: Omit<NewPromoBanner, "tenant_id"> = {
  title: "",
  description: "",
  active: false,
  background_color: "",
  text_color: "",
  expires_at: null,
};

export default function PrompBannerForm() {
  const [editingItem, setEditingItem] = useState<PromoBanner | null>(null);
  const [formData, setFormData] =
    useState<Omit<NewPromoBanner, "tenant_id">>(emptyForm);

  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const {
    allBanners,
    addPromoBanner,
    updatePromoBanner,
    deletePromoBanner,
    isAdding,
    isUpdating,
  } = usePromoBanners();
  const { data: promoBanners = [] } = allBanners;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.expires_at) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingItem) {
      updatePromoBanner.mutate(
        { ...formData, id: editingItem.id },
        {
          onSuccess: () => {
            setFormData(emptyForm);
            setEditingItem(null);
          },
        }
      );
    } else {
      addPromoBanner.mutate(formData, {
        onSuccess: () => {
          setFormData(emptyForm);
        },
      });
    }
  };

  const handleEdit = (item: PromoBanner) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      active: item.active,
      background_color: item.background_color || "",
      text_color: item.text_color || "",
      expires_at: item.expires_at || null,
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    deletePromoBanner.mutate(id, {
      onSuccess: () => {
        if (editingItem?.id === id) {
          setEditingItem(null);
          setFormData(emptyForm);
        }
      },
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setFormData(emptyForm);
  };

  return (
    <div className="min-h-screen bg-muted/50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/admin/${tenantSlug}`}
          className="flex gap-2 items-center justify-center border-border px-4 py-2 bg-accent-disabled hover:bg-accent transition-colors duration-300 rounded-sm my-4 max-w-max"
        >
          <ArrowLeft size={14} />
          <p className="text-sm">Go Back</p>
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 🔹 Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingItem ? "Edit Promo Banner" : "Add New Promo Banner"}
              </CardTitle>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Promo Banner Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />

                <Textarea
                  label="Description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  required
                />

                <ColorInput
                  label="Text Color"
                  value={formData.text_color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      text_color: e.target.value,
                    })
                  }
                />

                <ColorInput
                  label="Background Color"
                  value={formData.background_color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      background_color: e.target.value,
                    })
                  }
                />

                {formData.background_color && (
                  <div className="bg-muted flex flex-col rounded-sm p-3 space-y-2">
                    <h2 className="font-medium">Sample Text on Background</h2>
                    <div style={{ backgroundColor: formData.background_color }}>
                      <p
                        className="p-1 px-2 text-center rounded-xs"
                        style={{ color: formData.text_color }}
                      >
                        This is a sample text on the background
                      </p>
                    </div>
                    <div className="flex gap-1 items-center">
                      <p className="text-xs text-warning">Tips:</p>
                      <p className="text-xs text-info">
                        Ensure there is contrast between the text and the
                        background
                      </p>
                    </div>
                  </div>
                )}

                <DatePicker
                  label="Expires At"
                  value={formData.expires_at || null}
                  onSelect={(e) =>
                    setFormData({
                      ...formData,
                      expires_at: e.target?.value,
                    })
                  }
                />

                <div className="flex flex-col bg-muted/50 p-4 border-muted/80 border space-y-4 rounded-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Active</label>
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, active: checked })
                      }
                    />
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="flex gap-2 ">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={editingItem ? isUpdating : isAdding}
                    onClick={() => console.log("Form Data: ", formData)}
                  >
                    {editingItem ? (
                      <span className="flex gap-2 items-center">
                        {isUpdating ? (
                          <>
                            {" "}
                            <Loader2 className="h-4 w-4 animate-spin" />{" "}
                            Updating...{" "}
                          </>
                        ) : (
                          <>
                            {" "}
                            <Save className="h-4 w-4" /> Update{" "}
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="flex gap-2 items-center">
                        {isAdding ? (
                          <>
                            {" "}
                            <Loader2 className="h-4 w-4 animate-spin" />{" "}
                            Creating...{" "}
                          </>
                        ) : (
                          <>
                            {" "}
                            <Plus className="h-4 w-4" /> Create{" "}
                          </>
                        )}
                      </span>
                    )}
                  </Button>

                  {editingItem && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 🔹 Items list */}
          <Card>
            <CardHeader>
              <CardTitle>Added Promo Banners</CardTitle>
              <span>
                You have{" "}
                {promoBanners.length === 0 ? "no" : promoBanners.length} Promo
                Banner{promoBanners.length > 1 ? "s" : ""}
              </span>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent>
              <div className="space-y-4 h-full md:max-h-full max-h-96 overflow-y-auto">
                {promoBanners.map((banner) => (
                  <motion.div
                    key={banner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex banners-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="relative flex mb-1 w-full">
                      <div
                        className="relative flex flex-col p-2 rounded-md min-w-full"
                        style={{
                          backgroundColor: banner.background_color,
                          color: banner.text_color,
                        }}
                      >
                        <h3 className="font-medium truncate">{banner.title}</h3>
                        <p className="text-sm">{banner.description}</p>
                        <span className="flex gap-1 items-center">
                          <p className="text-xs">Expires:</p>
                          <p className="text-xs">
                            {formatDate(
                              banner.expires_at || "",
                              "dd MMMM yyyy"
                            )}
                          </p>
                        </span>
                        {banner.active ? (
                          <Badge
                            variant="secondary"
                            className="text-xs h-4 absolute left-1/2 top-0.5"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="text-xs h-4 absolute left-1/2 top-0.5"
                          >
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 absolute right-0.5 top-0.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {promoBanners.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No Promo banner found. Create your first promo banner!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
