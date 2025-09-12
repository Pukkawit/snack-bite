"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import Image from "next/image";
import { Separator } from "../ui/separator";
import Link from "next/link";
import ImageUploadField from "../ImageUploadField";
import { useMenuItems } from "@/hooks/db/useMenuItems"; // ✅ using our React Query hook
import type { MenuItem } from "@/types/menu";

export interface MenuItemFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
}

const emptyForm: MenuItemFormData = {
  name: "",
  description: "",
  price: "",
  category: "snacks",
  image_url: "",
  is_available: true,
  is_featured: false,
};

export function MenuItemForm() {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>(emptyForm);

  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const {
    data: menuItems = [],
    isLoading,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    isAdding,
    isUpdating,
  } = useMenuItems();

  if (isLoading) return <p>Loading...</p>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const menuItemData = {
      ...formData,
      price: parseFloat(formData.price),
    };

    if (editingItem) {
      updateMenuItem.mutate(
        { ...menuItemData, id: editingItem.id },
        {
          onSuccess: () => {
            setFormData(emptyForm);
            setEditingItem(null);
          },
        }
      );
    } else {
      addMenuItem.mutate(menuItemData, {
        onSuccess: () => {
          setFormData(emptyForm);
        },
      });
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || "",
      is_available: item.is_available,
      is_featured: item.is_featured,
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    deleteMenuItem.mutate(id, {
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
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </CardTitle>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Item Name *"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />

                <Textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />

                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price *"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />

                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="snacks">Snacks</SelectItem>
                    <SelectItem value="drinks">Drinks</SelectItem>
                    <SelectItem value="specials">Specials</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                    <SelectItem value="efik-ibibio">Efit-Ibibio</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex bg-muted/50 p-4 border-muted/80 border rounded-sm">
                  <ImageUploadField
                    label="Item Image"
                    id="image_url"
                    value={formData.image_url} // 🔹 controlled value
                    imageUploadButtonText1="Upload Image"
                    imageUploadButtonText2="Change Image"
                    cloudinaryOptions={{
                      cloudName:
                        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
                      uploadPreset:
                        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
                      folderName: `items-image/${tenantSlug}`,
                    }}
                    imageDimensions={{
                      maxWidth: 5000,
                      maxHeight: 5000,
                      minWidth: 100,
                      minHeight: 100,
                    }}
                    onChange={(e) => {
                      const url = e?.target?.value;
                      setFormData({ ...formData, image_url: url }); // ✅ save the real URL
                    }}
                  />
                </div>

                <div className="flex flex-col bg-muted/50 p-4 border-muted/80 border space-y-4 rounded-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Available</label>
                    <Switch
                      checked={formData.is_available}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_available: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Featured</label>
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_featured: checked })
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
              <CardTitle>Added Menu Items</CardTitle>
              <span>You have {menuItems.length} items in store</span>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent>
              <div className="space-y-4 h-full md:max-h-full max-h-96 overflow-y-auto">
                {menuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover"
                        width={48}
                        height={48}
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <div className="flex gap-1">
                          {item.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          )}
                          <Badge
                            variant={
                              item.is_available ? "default" : "destructive"
                            }
                            className="text-xs"
                          >
                            {item.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {item.category}
                      </p>
                      <p className="text-sm font-semibold text-orange-600">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {menuItems.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No menu items found. Create your first item!
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
