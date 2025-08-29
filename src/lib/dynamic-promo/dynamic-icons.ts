import type React from "react";
import * as LucideIcons from "lucide-react";

export type IconName = keyof typeof LucideIcons;

export function getDynamicIcon(
  iconName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): React.ComponentType<any> | null {
  // Convert kebab-case to PascalCase (e.g., "mouse-pointer-click" -> "MousePointerClick")
  const pascalCase = iconName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icon = (LucideIcons as any)[pascalCase];
  return icon || null;
}

// Common icon mappings for different action types
export const ACTION_ICON_MAP: Record<string, string> = {
  // WhatsApp actions
  "order now": "shopping-cart",
  "chat now": "message",
};
