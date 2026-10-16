import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Lets phones add KirayBet to the home screen with its own name and icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} · ${site.nameLatin}`,
    short_name: site.name,
    description: "Homes for rent from our community",
    start_url: "/",
    display: "standalone",
    background_color: "#141311",
    theme_color: "#447656",
    icons: [
      { src: "/app-icons/192", sizes: "192x192", type: "image/png" },
      { src: "/app-icons/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
