export async function deleteFromCloudinary(
  publicId: string,
  cloudName: string
): Promise<{ success: boolean; error?: string; result?: any }> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = await fetch("/api/cloudinary/cloudinary-sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: publicId, timestamp }),
    }).then((res) => res.text());

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        error: error.error?.message || "Deletion failed",
      };
    }

    const result = await response.json();

    // Check if Cloudinary returned a successful deletion result
    if (result.result === "ok" || result.result === "not found") {
      return {
        success: true,
        result,
      };
    } else {
      return {
        success: false,
        error: result.error?.message || "Deletion failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown deletion error",
    };
  }
}
