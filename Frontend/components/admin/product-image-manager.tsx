"use client";

import { useRef, useState } from "react";
import { Upload, X, Star, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Manages a product's featured image and gallery.
 *
 * Featured image (string | null) — the cover image; first image users see.
 * Gallery (string[]) — additional images shown as thumbnails on the product page.
 *
 * Uploads happen against POST /api/v1/admin/products/upload, which returns
 * a public URL the admin form can save when the product itself is saved.
 */
export function ProductImageManager({
  featured,
  gallery,
  onFeaturedChange,
  onGalleryChange,
}: {
  featured: string | null;
  gallery: string[];
  onFeaturedChange: (url: string | null) => void;
  onGalleryChange: (urls: string[]) => void;
}) {
  const featuredInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"featured" | "gallery" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadOne(file: File): Promise<string | null> {
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/proxy/v1/admin/products/upload", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: `Upload failed (${res.status})` }));
      setError(body.message ?? `Upload failed (${res.status})`);
      return null;
    }
    const body = (await res.json()) as { data: { url: string } };
    return body.data.url;
  }

  async function onFeaturedFile(file: File) {
    setBusy("featured");
    const url = await uploadOne(file);
    if (url) onFeaturedChange(url);
    setBusy(null);
  }

  async function onGalleryFiles(files: FileList) {
    setBusy("gallery");
    const uploaded: string[] = [];
    for (const f of Array.from(files)) {
      const url = await uploadOne(f);
      if (url) uploaded.push(url);
    }
    if (uploaded.length) onGalleryChange([...gallery, ...uploaded]);
    setBusy(null);
  }

  function removeGallery(idx: number) {
    onGalleryChange(gallery.filter((_, i) => i !== idx));
  }

  function moveGallery(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= gallery.length) return;
    const next = [...gallery];
    [next[idx], next[j]] = [next[j], next[idx]];
    onGalleryChange(next);
  }

  function promoteToFeatured(idx: number) {
    const url = gallery[idx];
    if (!url) return;
    const newGallery = gallery.filter((_, i) => i !== idx);
    if (featured) newGallery.unshift(featured);
    onFeaturedChange(url);
    onGalleryChange(newGallery);
  }

  return (
    <section className="rounded-lg border hairline bg-cream-deep/30 p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="font-display text-[13px] italic text-clay">Imagery</div>
          <h3 className="mt-1 font-display text-[22px] text-ink">Featured & gallery</h3>
          <p className="mt-1 max-w-xl text-[12px] text-ink-muted">
            The featured image is the cover users see first. Gallery images show as thumbnails on the product page.
          </p>
        </div>
      </div>

      {/* Featured */}
      <div className="mt-4 grid gap-4 md:grid-cols-[200px_1fr]">
        <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-md border hairline bg-paper">
          {featured ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={featured} alt="Featured" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">No featured image</span>
          )}
        </div>
        <div className="space-y-2">
          <Label>Featured image</Label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => featuredInput.current?.click()}
              disabled={busy === "featured"}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border hairline bg-paper px-4 text-[12px] font-medium text-ink transition-colors hover:bg-cream-deep disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {busy === "featured" ? "Uploading…" : featured ? "Replace" : "Upload"}
            </button>
            {featured ? (
              <button
                type="button"
                onClick={() => onFeaturedChange(null)}
                className="inline-flex h-9 items-center gap-1 rounded-full border hairline bg-paper px-3 text-[11px] font-medium text-[#8B2A1D] transition-colors hover:bg-[#FBEFE8]"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            ) : null}
            <input
              ref={featuredInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFeaturedFile(f);
                e.target.value = "";
              }}
            />
          </div>

          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">Or paste URL</div>
          <input
            type="url"
            value={featured ?? ""}
            onChange={(e) => onFeaturedChange(e.target.value || null)}
            placeholder="https://…/photo.jpg"
            className="h-10 w-full rounded-md border border-ink/15 bg-paper px-3 text-[13px] text-ink focus:border-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20"
          />
        </div>
      </div>

      {/* Gallery */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <Label>Gallery ({gallery.length})</Label>
          <button
            type="button"
            onClick={() => galleryInput.current?.click()}
            disabled={busy === "gallery"}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-forest px-4 text-[12px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {busy === "gallery" ? "Uploading…" : "Add images"}
          </button>
          <input
            ref={galleryInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) void onGalleryFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {gallery.length === 0 ? (
          <p className="rounded-md border hairline bg-paper px-4 py-3 text-[12px] italic text-ink-muted">
            No gallery images yet.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((url, idx) => (
              <li key={`${url}-${idx}`} className="group relative overflow-hidden rounded-md border hairline bg-paper">
                <div className="aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-ink/85 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-1">
                    <IconBtn title="Make featured" onClick={() => promoteToFeatured(idx)}>
                      <Star className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn title="Move up" onClick={() => moveGallery(idx, -1)} disabled={idx === 0}>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn title="Move down" onClick={() => moveGallery(idx, 1)} disabled={idx === gallery.length - 1}>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                  <IconBtn title="Remove" onClick={() => removeGallery(idx)} danger>
                    <X className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? <p className="mt-3 text-[12px] text-[#8B2A1D]">{error}</p> : null}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">{children}</div>;
}

function IconBtn({
  children, onClick, title, danger, disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors disabled:opacity-30",
        danger
          ? "bg-[#8B2A1D] text-cream hover:bg-[#731F13]"
          : "bg-cream/95 text-ink hover:bg-cream",
      )}
    >
      {children}
    </button>
  );
}
