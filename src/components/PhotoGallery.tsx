"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Listing photos: cover large, the rest as a grid. Tapping any photo opens a full-screen
// viewer (arrows, swipe, keyboard, thumbnails; tap the photo to zoom in and drag around).
export function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="grid h-72 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-96">
        <div className="col-span-4 row-span-2 bg-gradient-to-br from-brand-strong to-brand sm:col-span-3" />
        <div className="hidden bg-brand/70 sm:block" />
        <div className="hidden bg-brand/50 sm:block" />
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl sm:grid-cols-4">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1} of ${photos.length}`}
              className={`group relative cursor-zoom-in bg-border/50 ${i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-[4/3]"}`}
            >
              <Image
                src={src}
                alt={i === 0 ? title : `${title}, photo ${i + 1}`}
                fill
                priority={i === 0}
                sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 640px) 25vw, 50vw"}
                className="object-cover transition group-hover:brightness-90"
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(0)}
          className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur hover:bg-black/85"
        >
          ⤢ View {photos.length} {photos.length === 1 ? "photo" : "photos"}
        </button>
      </div>
      {open !== null && <PhotoViewer photos={photos} title={title} start={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function PhotoViewer({ photos, title, start, onClose }: { photos: string[]; title: string; start: number; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  // Mouse drag to look around a zoomed photo (touch screens scroll natively).
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const count = photos.length;

  const go = (step: number) => {
    setZoomed(false);
    setIndex((i) => (i + step + count) % count);
  };

  useEffect(() => {
    const d = dialog.current;
    d?.showModal();
    // Keep the page behind from scrolling while the viewer is open.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      d?.close();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Zoom in on the spot that was tapped.
  function toggleZoom(e: React.MouseEvent) {
    if (drag.current?.moved) return;
    if (zoomed) return setZoomed(false);
    const box = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - box.left) / box.width;
    const fy = (e.clientY - box.top) / box.height;
    setZoomed(true);
    requestAnimationFrame(() => {
      const s = stage.current;
      if (s) s.scrollTo({ left: fx * s.scrollWidth - s.clientWidth / 2, top: fy * s.scrollHeight - s.clientHeight / 2 });
    });
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-label={`${title}: photos`}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm font-semibold tabular-nums" aria-live="polite">
            {index + 1} / {count}
          </p>
          <p className="hidden min-w-0 truncate text-sm text-white/70 sm:block">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photos"
            className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          <div
            ref={stage}
            className={`h-full w-full ${zoomed ? "overflow-auto" : "overflow-hidden"}`}
            onPointerDown={(e) => {
              const s = stage.current;
              if (zoomed && s && e.pointerType === "mouse") {
                drag.current = { x: e.clientX, y: e.clientY, left: s.scrollLeft, top: s.scrollTop, moved: false };
              }
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              const s = stage.current;
              if (!d || !s) return;
              const dx = e.clientX - d.x;
              const dy = e.clientY - d.y;
              if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
              s.scrollTo({ left: d.left - dx, top: d.top - dy });
            }}
            onPointerUp={() => {
              // Let the click that ends a drag through first, then forget the drag.
              setTimeout(() => (drag.current = null));
            }}
            onTouchStart={(e) => {
              if (!zoomed) swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchEnd={(e) => {
              const start = swipe.current;
              swipe.current = null;
              if (!start || zoomed) return;
              const dx = e.changedTouches[0].clientX - start.x;
              const dy = e.changedTouches[0].clientY - start.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- full-size original, not a resized copy */}
            <img
              key={photos[index]}
              src={photos[index]}
              alt={`${title}, photo ${index + 1} of ${count}`}
              onClick={toggleZoom}
              draggable={false}
              className={
                zoomed
                  ? "max-w-none cursor-zoom-out select-none"
                  : "mx-auto h-full w-full cursor-zoom-in select-none object-contain"
              }
              style={zoomed ? { width: "200%" } : undefined}
            />
          </div>
          {count > 1 && !zoomed && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-2xl backdrop-blur hover:bg-white/30 sm:left-4"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-2xl backdrop-blur hover:bg-white/30 sm:right-4"
              >
                ›
              </button>
            </>
          )}
        </div>

        <p className="px-4 pt-2 text-center text-xs text-white/60">
          {zoomed ? "Drag to look around · tap to zoom out" : "Tap the photo to zoom in"}
          {count > 1 && !zoomed && " · swipe or use the arrows"}
        </p>
        {count > 1 && (
          <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
            {photos.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  setZoomed(false);
                  setIndex(i);
                }}
                aria-label={`Photo ${i + 1}`}
                aria-current={i === index}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ${i === index ? "ring-2 ring-door" : "opacity-60 hover:opacity-100"}`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}
