"use client";

import "leaflet/dist/leaflet.css";
import "./ListingsMap.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { formatPrice, nearLabel } from "@/lib/format";
import type { ListingPin } from "@/lib/listings";

// OpenStreetMap with soft circles over each listing's blurred (~1 km) area, never
// a pin on the house. Each home has a price pin; homes that share an area fan out
// inside its circle, and collapse into one numbered badge when zoomed out.
// `interactive={false}` gives a still map (for listing pages, so phones can scroll past).

const denver: [number, number] = [39.72, -104.9];
const areaRadiusMeters = 700;
// From this zoom level in, homes that share an area are shown as separate pins.
const spreadZoom = 15;
// Below this zoom, prices are shortened ("$1.9k") so pins don't crowd each other.
const shortPriceZoom = 12;
// Roughly how many meters one screen pixel covers at spreadZoom around Denver.
const metersPerPixelAtSpread = 3.7;

function shortPrice(price: number) {
  return price >= 1000 ? `$${(Math.round(price / 100) / 10).toString()}k` : `$${price}`;
}

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

      // Popups are built from DOM nodes with textContent, so listing text can't inject HTML.
      const homeLink = (home: ListingPin, text: string) => {
        const link = document.createElement("a");
        link.href = `/listings/${home.id}`;
        link.className = "block font-semibold";
        link.textContent = text;
        link.addEventListener("click", (e) => {
          e.preventDefault();
          router.push(`/listings/${home.id}`);
        });
        return link;
      };
      const note = (text: string) => {
        const p = document.createElement("p");
        p.className = "text-xs text-muted";
        p.textContent = text;
        return p;
      };

      // A home alone in its area always shows as a price pin. Where several homes share
      // an area, zoomed out shows one numbered badge (badges); zoomed in spreads them
      // out as price pins in a ring inside the circle (spread).
      const singles = L.layerGroup().addTo(map);
      const badges = L.layerGroup();
      const spread = L.layerGroup();
      const lngScale = Math.cos((denver[0] * Math.PI) / 180);

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

        // One price pin per home. Positions are only spread around the blurred
        // center for readability; they say nothing about where each home really is.
        // Ring big enough to fit the pins side by side (about 80px each) at spreadZoom,
        // but still inside the area's circle.
        const ring =
          homes.length === 1
            ? 0
            : Math.min(areaRadiusMeters * 0.85, Math.max(120, ((homes.length * 80) / (2 * Math.PI)) * metersPerPixelAtSpread));
        homes.forEach((home, i) => {
          const angle = (2 * Math.PI * i) / homes.length - Math.PI / 2;
          const position: [number, number] = [
            center[0] + (ring * Math.cos(angle)) / 111_000,
            center[1] + (ring * Math.sin(angle)) / (111_000 * lngScale),
          ];
          const popup = document.createElement("div");
          popup.className = "space-y-1";
          popup.append(
            homeLink(home, home.title),
            note(`${formatPrice(home.price)}/mo · ${nearLabel(home)}`),
            note("Approximate area, not the exact address"),
          );
          const pin = L.marker(position, {
            icon: L.divIcon({
              className: "map-price",
              html: `<span><b class="full">${formatPrice(home.price)}</b><b class="short">${shortPrice(home.price)}</b></span>`,
              iconSize: [72, 30],
              iconAnchor: [36, 15],
            }),
            title: `${formatPrice(home.price)}/mo · ${home.title}`,
            keyboard: true,
          }).bindPopup(popup, { maxWidth: 260 });
          (homes.length === 1 ? singles : spread).addLayer(pin);
        });

        if (homes.length > 1) {
          const popup = document.createElement("div");
          popup.className = "space-y-2";
          popup.append(note(`${nearLabel(homes[0])} · approximate area`));
          for (const home of homes) popup.append(homeLink(home, `${formatPrice(home.price)}/mo · ${home.title}`));
          const zoomIn = document.createElement("button");
          zoomIn.type = "button";
          zoomIn.className = "text-xs font-semibold text-accent";
          zoomIn.textContent = "Zoom in to see each home →";
          zoomIn.addEventListener("click", () => map?.setView(center, spreadZoom));
          popup.append(zoomIn);
          badges.addLayer(
            L.marker(center, {
              icon: L.divIcon({ className: "map-badge", html: String(homes.length), iconSize: [34, 34] }),
              title: `${homes.length} homes · ${nearLabel(homes[0])}`,
              keyboard: true,
            }).bindPopup(popup, { maxWidth: 260 }),
          );
        }
      }

      if (interactive) {
        const showLayers = () => {
          const zoom = map!.getZoom();
          const zoomedIn = zoom >= spreadZoom;
          map!.removeLayer(zoomedIn ? badges : spread);
          map!.addLayer(zoomedIn ? spread : badges);
          map!.getContainer().classList.toggle("short-prices", zoom < shortPriceZoom);
        };
        map.on("zoomend", showLayers);
        showLayers();
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
