"use client";

import { useState } from "react";
import { maxPhotos } from "@/lib/listing-rules";
import { randomId } from "@/lib/random-id";
import { createBrowserSupabase } from "@/lib/supabase/browser";

// `saved` photos already belong to the listing: removing one only takes effect when the
// form is saved. New uploads that get removed are deleted from storage right away.
export type Photo = { path: string; preview: string; saved?: boolean };

const bucket = "listing-photos";
const maxSide = 1600;

// Redraws the photo at most 1600px on its longest side and saves a fresh JPEG.
// Re-encoding drops all metadata, including the GPS location phones add to photos.
async function toCleanJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode"))), "image/jpeg", 0.82),
  );
}

export function PhotoPicker({
  userId,
  listingId,
  initialPhotos,
  error,
  onBusyChange,
}: {
  userId: string;
  listingId: string;
  initialPhotos: Photo[];
  error?: string;
  onBusyChange: (busy: boolean) => void;
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);

  async function addFiles(files: FileList) {
    const room = maxPhotos - photos.length;
    const chosen = Array.from(files).slice(0, room);
    setProblem(files.length > room ? `You can add up to ${maxPhotos} photos.` : null);
    if (chosen.length === 0) return;

    const supabase = createBrowserSupabase();
    setUploading(chosen.length);
    onBusyChange(true);
    for (const file of chosen) {
      try {
        const jpeg = await toCleanJpeg(file);
        const path = `${userId}/${listingId}/${randomId()}.jpg`;
        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, jpeg, { contentType: "image/jpeg", upsert: false });
        if (error) throw error;
        setPhotos((current) => [...current, { path, preview: URL.createObjectURL(jpeg) }]);
      } catch {
        setProblem(`Couldn't add "${file.name}". Try a JPEG or PNG photo.`);
      }
      setUploading((n) => n - 1);
    }
    onBusyChange(false);
  }

  function remove(photo: Photo) {
    setPhotos((current) => current.filter((p) => p !== photo));
    if (photo.saved) return;
    URL.revokeObjectURL(photo.preview);
    void createBrowserSupabase().storage.from(bucket).remove([photo.path]);
  }

  function makeCover(photo: Photo) {
    setPhotos((current) => [photo, ...current.filter((p) => p !== photo)]);
  }

  return (
    <div className="space-y-3">
      {photos.map((p) => (
        <input key={p.path} type="hidden" name="photos" value={p.path} />
      ))}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((photo, i) => (
          <li key={photo.path} className="relative overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview or short-lived signed link */}
            <img src={photo.preview} alt={`Photo ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
                Cover
              </span>
            )}
            <div className="flex justify-between bg-surface px-2 py-1.5 text-xs">
              {i > 0 ? (
                <button type="button" onClick={() => makeCover(photo)} className="text-brand hover:underline">
                  Make cover
                </button>
              ) : (
                <span />
              )}
              <button type="button" onClick={() => remove(photo)} className="text-danger hover:underline">
                Remove
              </button>
            </div>
          </li>
        ))}
        {Array.from({ length: uploading }, (_, i) => (
          <li key={`uploading-${i}`} className="grid aspect-[4/3] animate-pulse place-items-center rounded-xl bg-border/50 text-xs text-muted">
            Uploading…
          </li>
        ))}
      </ul>
      {photos.length + uploading < maxPhotos && (
        <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-brand">
          <span className="font-semibold text-brand">+ Add photos · ፎቶ ያክሉ</span>
          <span className="text-xs text-muted">
            Up to {maxPhotos}. Bright photos of every room work best. The first photo is the cover.
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}
      <details open className="rounded-xl bg-brand-soft p-3 text-sm">
        <summary className="cursor-pointer font-semibold">📸 Tips for great photos · የፎቶ ምክሮች</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          <li>Take photos in daylight with lights on and curtains open.</li>
          <li>Hold the phone sideways (landscape) at chest height, standing in a corner to show the whole room.</li>
          <li>Tidy up first, and include every room: bedroom, kitchen, bathroom, living area and the entrance.</li>
          <li>Add the outside and parking, but not the house number or street signs.</li>
          <li>Leave people, family photos and mail out of the picture.</li>
        </ul>
        <p className="mt-2 text-xs text-muted">
          🔒 We remove hidden location data from your photos before uploading.
        </p>
      </details>
      {(problem || error) && (
        <p role="alert" className="text-sm text-danger">
          {problem ?? error}
        </p>
      )}
    </div>
  );
}
