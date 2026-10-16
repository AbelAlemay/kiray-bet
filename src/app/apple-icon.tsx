import { appIcon } from "@/lib/app-icon";

// Icon for "Add to Home Screen" on iPhone and "Add to Dock" on Mac.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return appIcon(180);
}
