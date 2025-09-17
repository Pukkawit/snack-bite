type ActionType =
  | "whatsapp"
  | "email"
  | "link"
  | "scroll"
  | "phone"
  | "download";

type PromoData = {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  actionButtonText: string;
  actionButtonIcon?: string;
  buttonAction: {
    type: ActionType;
    value: string;
    metadata?: {
      message?: string;
      businessName?: string;
      subject?: string;
      body?: string;
      openInNewTab?: boolean;
      behavior?: "smooth" | "instant";
      block?: "start" | "center" | "end";
      displayText?: string;
      filename?: string;
    };
  };
  created_at: string;
  updated_at: string;
  expires_at: string;
  active: boleean;
};

type Promo = Omit<
  PromoData,
  "id" | "tenant_id" | "expires_at" | "active" | "updated_at" | "created_at"
>;
