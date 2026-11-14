"use client";

import React from "react";
import { ImagePlus, X, CheckCircle2, AlertCircle } from "lucide-react";

export interface GalleryPhotoItem {
  id: string;
  preview: string;
  file?: File;
}

interface ImageUploadProps {
  photos: GalleryPhotoItem[];
  onAddFiles: (files: FileList) => void;
  onAddPresetUrl: (url: string) => void;
  onRemovePhoto: (id: string) => void;
  minPhotos?: number;
  maxPhotos?: number;
}

const PRESET_GALLERY = [
  {
    label: "Harbor Daylight Hall",
    url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85",
  },
  {
    label: "Glasshouse Conservatory",
    url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=85",
  },
  {
    label: "Industrial Brick Loft",
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85",
  },
  {
    label: "Culinary & Banquet Table",
    url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=85",
  },
  {
    label: "Editorial Floral Table",
    url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function ImageUpload({
  photos,
  onAddFiles,
  onAddPresetUrl,
  onRemovePhoto,
  minPhotos = 3,
  maxPhotos = 5,
}: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onAddFiles(files);
    }
    e.target.value = "";
  };

  const isCountValid = photos.length >= minPhotos && photos.length <= maxPhotos;
  const isFull = photos.length >= maxPhotos;

  return (
    <div className="w-full space-y-4">
      {/* Live photo count status */}
      <div
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs ${
          isCountValid
            ? "border-emerald-600/40 bg-emerald-500/10 text-[var(--ink)]"
            : "border-amber-600/40 bg-amber-500/10 text-[var(--ink)]"
        }`}
      >
        <div className="flex items-center gap-2">
          {isCountValid ? (
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={15} className="text-amber-600 shrink-0" />
          )}
          <span className="font-medium">
            {photos.length < minPhotos
              ? `Add at least ${minPhotos - photos.length} more photo${
                  minPhotos - photos.length === 1 ? "" : "s"
                } (minimum ${minPhotos} required)`
              : "Photo requirement met!"}
          </span>
        </div>
        <span className="font-semibold">
          {photos.length} / {maxPhotos} photos
        </span>
      </div>

      {/* Upload Dropzone */}
      {!isFull && (
        <label className="relative cursor-pointer hover:opacity-90 transition border-2 border-dashed border-[var(--line)] hover:border-[var(--ink)] rounded-xl p-5 flex flex-col justify-center items-center gap-2 text-[var(--muted)] bg-[var(--soft)]">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <ImagePlus size={28} className="text-[var(--ink)]" />
          <div className="font-semibold text-sm text-[var(--ink)]">
            Click to upload photos ({minPhotos}–{maxPhotos} photos)
          </div>
          <p className="text-[11px] text-[var(--muted)]">
            Select multiple JPG, PNG, or WebP images from your device
          </p>
        </label>
      )}

      {/* Selected Gallery Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {photos.map((item, idx) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--soft)] group"
            >
              <img
                src={item.preview}
                alt={`Listing photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-white text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemovePhoto(item.id)}
                aria-label={`Remove photo ${idx + 1}`}
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-red-600 transition cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Architectural Sample Presets */}
      {!isFull && (
        <div className="space-y-2 text-left">
          <span className="block text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            Quick-add verified sample photos (click to add):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {PRESET_GALLERY.map((item) => {
              const alreadyAdded = photos.some((p) => p.preview === item.url);
              return (
                <button
                  key={item.url}
                  type="button"
                  disabled={alreadyAdded || isFull}
                  onClick={() => onAddPresetUrl(item.url)}
                  className={`relative rounded-lg overflow-hidden border-2 h-14 group cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                    alreadyAdded
                      ? "border-[var(--ink)]"
                      : "border-transparent hover:border-[var(--line)]"
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[9px] px-1 py-0.5 truncate">
                    {alreadyAdded ? "Added ✓" : item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
