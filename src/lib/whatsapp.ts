import { supabase } from "./supabase/client";
import { useParams } from "next/navigation";
import { fetchTenantIdBySlug } from "./utils";

export const fetchWhatsappPhone = async (
  tenantSlug: string,
): Promise<string | null> => {
  const tenantId = await fetchTenantIdBySlug(tenantSlug);

  const { data, error } = await supabase
    .from("snack_bite_restaurant_info")
    .select("whatsapp")
    .eq("tenant_id", tenantId)
    .single(); // ✅ ensures we only get one row

  if (error) {
    console.error("Error fetching WhatsApp number:", error);
    return null;
  }
  return data?.whatsapp || null;
};

export function useWhatsAppPhone(): Promise<string | null> {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string | undefined;

  return fetchWhatsappPhone(tenantSlug || "");
}

export async function generateWhatsAppURL(
  whatsappPhone: string,
  message: string,
): Promise<string | null> {
  const encodedMessage = encodeURIComponent(message);

  if (!whatsappPhone) {
    console.error("No WhatsApp number found in DB");
    return null;
  }

  return `https://wa.me/${
    whatsappPhone.replace(/\D/g, "")
  }?text=${encodedMessage}`;
  // replace(/\D/g,"") removes any "+" or spaces, WhatsApp requires digits only
}

export function createOrderMessage(
  items: { name: string; quantity: number; price: number }[],
  tenantName: string,
): string {
  const orderDetails = items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.name} - $${
          (item.price * item.quantity).toFixed(2)
        }`,
    )
    .join("\n");

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return `Hi! I'd like to place an order from ${tenantName}:

${orderDetails}

Total: $${total.toFixed(2)}

Please confirm availability and delivery details. Thank you!`;
}
