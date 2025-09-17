import { generateWhatsAppURL } from "../whatsapp";

export interface ActionConfig {
  type: ActionType;
  data: {
    message?: string;
    email?: string;
    subject?: string;
    body?: string;
    url?: string;
    target?: string;
    phone?: string;
    elementId?: string;
    downloadUrl?: string;
    filename?: string;
  };
}

export async function handleAction(
  whatsappNumber: string,
  config: ActionConfig,
): Promise<void> {
  switch (config.type) {
    case "whatsapp":
      if (config.data.message) {
        const whatsappUrl = await generateWhatsAppURL(
          whatsappNumber,
          config.data.message,
        );
        if (whatsappUrl) {
          window.open(whatsappUrl, "_blank");
        }
      }
      break;

    case "email":
      const emailParams = new URLSearchParams();
      if (config.data.subject) {
        emailParams.append("subject", config.data.subject);
      }
      if (config.data.body) emailParams.append("body", config.data.body);

      const emailUrl = `mailto:${config.data.email || ""}${
        emailParams.toString() ? "?" + emailParams.toString() : ""
      }`;
      window.location.href = emailUrl;
      break;

    case "link":
      if (config.data.url) {
        const target = config.data.target || "_blank";
        window.open(config.data.url, target);
      }
      break;

    case "scroll":
      if (config.data.elementId) {
        const element = document.getElementById(config.data.elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      break;

    case "phone":
      if (config.data.phone) {
        window.location.href = `tel:${config.data.phone}`;
      }
      break;

    case "download":
      if (config.data.downloadUrl) {
        const link = document.createElement("a");
        link.href = config.data.downloadUrl;
        link.download = config.data.filename || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      break;

    default:
      console.warn("Unknown action type:", config.type);
  }
}
