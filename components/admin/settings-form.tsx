"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiRequestError, randomIdempotencyKey } from "@/lib/api-client";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import type { SettingGroups, SettingItem, SettingsPayload } from "@/lib/types";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const GROUP_LABELS: Record<string, { title: string; blurb: string }> = {
  branding: { title: "Branding", blurb: "Logo, favicon, social share image and brand colours." },
  business: { title: "Business info", blurb: "Public contact details shown across the site." },
  social: { title: "Social links", blurb: "URLs for your social profiles (leave blank to hide)." },
  seo: { title: "SEO & analytics", blurb: "Meta tags and tracking IDs." },
  order: { title: "Order rules", blurb: "Shop hours, minimum order, lead time." },
  delivery: { title: "Delivery defaults", blurb: "Fallback fees/ETAs when a postcode isn't in a service area." },
  tax: { title: "Tax", blurb: "VAT rate in basis points (e.g. 2000 = 20%)." },
  compliance: { title: "Compliance", blurb: "Age limits and ID-required categories." },
  legal: { title: "Legal URLs", blurb: "Links to your policy pages." },
  maintenance: { title: "Maintenance", blurb: "Temporarily take the site offline." },
  notifications: { title: "Notifications", blurb: "Where operational alerts should go." },
};

const GROUP_ORDER = [
  "branding", "business", "social", "seo", "order", "delivery",
  "tax", "compliance", "legal", "maintenance", "notifications",
];

type Values = Record<string, unknown>;

export function SettingsForm({ initial }: { initial: SettingsPayload }) {
  const router = useRouter();

  const initialValues: Values = useMemo(() => {
    const out: Values = {};
    Object.values(initial.groups).forEach((items) => {
      items.forEach((i) => { out[i.key] = i.value; });
    });
    return out;
  }, [initial]);

  const groups: SettingGroups = initial.groups;
  const orderedGroupKeys = useMemo(() => {
    const present = Object.keys(groups);
    const known = GROUP_ORDER.filter((k) => present.includes(k));
    const extras = present.filter((k) => !GROUP_ORDER.includes(k));
    return [...known, ...extras];
  }, [groups]);

  const [activeTab, setActiveTab] = useState<string>(orderedGroupKeys[0] ?? "branding");
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [savingAll, setSavingAll] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function setValue(key: string, v: unknown) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  // Only send keys that differ from the initial value — minimises validation noise.
  const dirty = useMemo(() => {
    const out: Values = {};
    for (const k of Object.keys(values)) {
      if (JSON.stringify(values[k]) !== JSON.stringify(initialValues[k])) out[k] = values[k];
    }
    return out;
  }, [values, initialValues]);

  const dirtyCount = Object.keys(dirty).length;

  async function saveAll(e?: React.FormEvent) {
    e?.preventDefault();
    setErrors({});
    setSavingAll(true);
    try {
      await apiClient("/api/v1/admin/settings", {
        method: "PUT",
        json: { settings: dirty },
        idempotencyKey: randomIdempotencyKey(),
      });
      setSavedAt(Date.now());
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError && err.body.errors) {
        const cleaned: Record<string, string[]> = {};
        for (const [k, v] of Object.entries(err.body.errors)) {
          cleaned[k.replace(/^settings\./, "")] = v;
        }
        setErrors(cleaned);
      } else if (err instanceof ApiRequestError) {
        setErrors({ _global: [err.body.message] });
      } else {
        setErrors({ _global: ["Something went wrong."] });
      }
    } finally {
      setSavingAll(false);
    }
  }

  const items = groups[activeTab] ?? [];
  const groupMeta = GROUP_LABELS[activeTab] ?? { title: activeTab, blurb: "" };

  return (
    <form onSubmit={saveAll} className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b hairline pb-3">
        {orderedGroupKeys.map((gk) => {
          const label = GROUP_LABELS[gk]?.title ?? gk;
          const isActive = gk === activeTab;
          return (
            <button
              key={gk}
              type="button"
              onClick={() => setActiveTab(gk)}
              className={cn(
                "rounded-full px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors",
                isActive
                  ? "bg-forest text-cream"
                  : "bg-cream-deep text-ink-muted hover:bg-cream-deep/70",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border hairline bg-paper p-6 md:p-8">
        <div className="font-display text-[13px] italic text-clay">Section</div>
        <h2 className="mt-1 font-display text-[26px] text-ink">{groupMeta.title}</h2>
        {groupMeta.blurb ? <p className="mt-1 text-[13px] text-ink-muted">{groupMeta.blurb}</p> : null}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <FieldRenderer
              key={item.key}
              item={item}
              value={values[item.key]}
              onChange={(v) => setValue(item.key, v)}
              error={errors[item.key]?.[0]}
            />
          ))}
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-full border hairline bg-paper/95 px-5 py-3 shadow-[0_10px_30px_-12px_rgba(10,22,40,0.25)] backdrop-blur">
        <div className="flex items-center gap-3 text-[12px] text-ink-muted">
          {dirtyCount === 0 ? (
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-forest" /> All changes saved</span>
          ) : (
            <span className="flex items-center gap-1.5"><AlertCircle className="h-4 w-4 text-clay" /> {dirtyCount} unsaved change{dirtyCount === 1 ? "" : "s"}</span>
          )}
          {errors._global ? <span className="text-[#8B2A1D]">{errors._global[0]}</span> : null}
          {savedAt ? <span className="text-forest">Saved.</span> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={dirtyCount === 0 || savingAll}
            onClick={() => { setValues(initialValues); setErrors({}); }}
            className="inline-flex h-10 items-center rounded-full border hairline bg-paper px-5 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={dirtyCount === 0 || savingAll}
            className="inline-flex h-10 items-center rounded-full bg-forest px-6 text-[12px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
          >
            {savingAll ? "Saving…" : `Save ${dirtyCount || ""}`}
          </button>
        </div>
      </div>
    </form>
  );
}

function FieldRenderer({
  item,
  value,
  onChange,
  error,
}: {
  item: SettingItem;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
}) {
  switch (item.type) {
    case "bool":
      return (
        <label className="col-span-full flex items-start gap-3 rounded-md border hairline bg-cream-deep/40 px-4 py-3">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-forest"
          />
          <div>
            <div className="text-[13px] font-medium text-ink">{item.label}</div>
            <div className="text-[11px] text-ink-muted">{item.key}</div>
          </div>
        </label>
      );

    case "text":
      return (
        <div className="col-span-full space-y-1.5">
          <Label>{item.label}</Label>
          <Textarea
            value={asString(value)}
            onChange={(e) => onChange(e.target.value)}
          />
          <KeyHint k={item.key} />
          <FieldError>{error}</FieldError>
        </div>
      );

    case "int":
      return (
        <div className="space-y-1.5">
          <Label>{item.label}</Label>
          <Input
            type="number"
            value={value === null || value === undefined ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          />
          <KeyHint k={item.key} />
          <FieldError>{error}</FieldError>
        </div>
      );

    case "url":
      return (
        <div className="space-y-1.5">
          <Label>{item.label}</Label>
          <Input
            type="url"
            placeholder="https://"
            value={asString(value)}
            onChange={(e) => onChange(e.target.value)}
          />
          <KeyHint k={item.key} />
          <FieldError>{error}</FieldError>
        </div>
      );

    case "email":
      return (
        <div className="space-y-1.5">
          <Label>{item.label}</Label>
          <Input
            type="email"
            value={asString(value)}
            onChange={(e) => onChange(e.target.value)}
          />
          <KeyHint k={item.key} />
          <FieldError>{error}</FieldError>
        </div>
      );

    case "image":
      return (
        <div className="col-span-full">
          <ImageField
            item={item}
            value={asString(value)}
            onChange={onChange}
            error={error}
          />
        </div>
      );

    case "json":
      return (
        <div className="col-span-full space-y-1.5">
          <Label>{item.label}</Label>
          <Textarea
            className="font-mono text-[12px]"
            rows={5}
            value={typeof value === "string" ? value : JSON.stringify(value ?? null, null, 2)}
            onChange={(e) => {
              const raw = e.target.value;
              try {
                onChange(raw === "" ? null : JSON.parse(raw));
              } catch {
                onChange(raw); // keep raw text while typing; server will validate
              }
            }}
          />
          <KeyHint k={item.key} />
          <FieldError>{error}</FieldError>
        </div>
      );

    case "string":
    default:
      return (
        <div className="space-y-1.5">
          <Label>{item.label}</Label>
          <Input
            value={asString(value)}
            onChange={(e) => onChange(e.target.value)}
          />
          <KeyHint k={item.key} />
          <FieldError>{error}</FieldError>
        </div>
      );
  }
}

function ImageField({
  item, value, onChange, error,
}: {
  item: SettingItem;
  value: string;
  onChange: (v: unknown) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("key", item.key);
      const res = await fetch("/api/v1/admin/settings/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: `Upload failed (${res.status})` }));
        throw new Error(body.message ?? `Upload failed (${res.status})`);
      }
      const body = (await res.json()) as { data: { url: string } };
      onChange(body.data.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-md border hairline bg-cream-deep/30 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border hairline bg-paper">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={item.label} className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">No file</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-ink">{item.label}</div>
          <div className="truncate text-[11px] text-ink-muted">{value || "—"}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-9 items-center gap-2 rounded-full border hairline bg-paper px-4 text-[12px] font-medium text-ink transition-colors hover:bg-cream-deep disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="text-[11px] font-medium text-[#8B2A1D] transition-colors hover:text-[#731F13]"
              >
                Remove
              </button>
            ) : null}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-ink-muted">Or paste a URL:</div>
      <Input
        className="mt-1"
        placeholder="https://…/logo.png"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <KeyHint k={item.key} />
      <FieldError>{uploadError ?? error}</FieldError>
    </div>
  );
}

function KeyHint({ k }: { k: string }) {
  return <div className="text-[10px] uppercase tracking-[0.14em] text-ink-muted/70">{k}</div>;
}

function asString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}
