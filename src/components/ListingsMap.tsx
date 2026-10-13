"use client";

import "leaflet/dist/leaflet.css";
import "./ListingsMap.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { formatPrice, placeLabel } from "@/lib/format";
import type { ListingPin } from "@/lib/listings";

// OpenStreetMap with soft circles over each listing's blurred (~1 km) area, never
// a pin on the house. Homes in the same area share one circle, with a numbered badge;
// tapping the badge lists them.
// `interactive={false}` gives a still map (for listing pages, so phones can scroll past).

const denver: [number, number] = [39.72, -104.9];
const areaRadiusMeters = 700;

export function ListingsMap({
  pins,
  interactive = true,
  zoom,
  className = "h-[60vh] min-h-80",
}: {
  pins: ListingPin[];
  interactive?: boolean;
  zoom?: number;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !box.current) return;
      map = L.map(box.current, {
        center: denver,
        zoom: zoom ?? 10,
        maxZoom: 15,
        scrollWheelZoom: false,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
        zoomControl: interactive,
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 15,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // One circle per blurred area.
      const areas = new Map<string, ListingPin[]>();
      for (const pin of pins) {
        const key = `${pin.lat},${pin.lng}`;
        areas.set(key, [...(areas.get(key) ?? []), pin]);
      }

      for (const homes of areas.values()) {
        const center: [number, number] = [homes[0].lat, homes[0].lng];
        L.circle(center, {
          radius: areaRadiusMeters,
          color: "#f5c75a",
          weight: 2,
          fillColor: "#f5c75a",
          fillOpacity: 0.2,
          interactive: false,
        }).addTo(map);
        if (!interactive) continue;

        // A tappable badge with the number of homes in this area.
        const badge = L.marker(center, {
          icon: L.divIcon({ className: "map-badge", html: String(homes.length), iconSize: [34, 34] }),
          title: `${homes.length} ${homes.length === 1 ? "home" : "homes"} near ${placeLabel(homes[0])}`,
          keyboard: true,
        }).addTo(map);

        // Built from DOM nodes with textContent, so listing text can't inject HTML.
        const popup = document.createElement("div");
        popup.className = "space-y-2";
        const heading = document.createElement("p");
        heading.className = "text-xs text-muted";
        heading.textContent = `Near ${placeLabel(homes[0])} · approximate area`;
        popup.append(heading);
        for (const home of homes) {
          const link = document.createElement("a");
          link.href = `/listings/${home.id}`;
          link.className = "block font-semibold";
          link.textContent = `${formatPrice(home.price)}/mo · ${home.title}`;
          link.addEventListener("click", (e) => {
            e.preventDefault();
            router.push(`/listings/${home.id}`);
          });
          popup.append(link);
        }
        badge.bindPopup(popup, { maxWidth: 260 });
      }

      if (pins.length > 1) {
        map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 13 });
      } else if (pins.length === 1) {
        map.setView([pins[0].lat, pins[0].lng], zoom ?? 13);
      }
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [pins, interactive, zoom, router]);

  return <div ref={box} className={`listings-map z-0 overflow-hidden rounded-2xl border border-border ${className}`} />;
}
