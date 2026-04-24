"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiRequestError, randomIdempotencyKey } from "@/lib/api-client";
import { Input, Label, FieldError } from "@/components/ui/input";
import type { ServiceArea } from "@/lib/types";
import { Plus, Trash2, Save } from "lucide-react";

type Draft = {
  id?: string;
  postcode_prefix: string;
  delivery_fee_pence: number;
  priority_fee_pence: number | null;
  super_fee_pence: number | null;
  eta_standard_minutes: number | null;
  eta_priority_minutes: number | null;
  is_active: boolean;
};

const BLANK: Draft = {
  postcode_prefix: "",
  delivery_fee_pence: 500,
  priority_fee_pence: 500,
  super_fee_pence: 1500,
  eta_standard_minutes: 25,
  eta_priority_minutes: 15,
  is_active: true,
};

export function ServiceAreasManager({ initial }: { initial: ServiceArea[] }) {
  const router = useRouter();
  const [areas, setAreas] = useState<ServiceArea[]>(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  async function createOne(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      const res = await apiClient<{ data: ServiceArea }>("/api/v1/admin/service-areas", {
        method: "POST",
        json: draft,
        idempotencyKey: randomIdempotencyKey(),
      });
      setAreas((a) => [...a, res.data].sort(byPrefix));
      setDraft(BLANK);
      setShowAdd(false);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) setErrors(err.body.errors ?? { postcode_prefix: [err.body.message] });
    } finally {
      setBusy(false);
    }
  }

  async function saveRow(id: string, patch: Partial<ServiceArea>) {
    setBusy(true);
    try {
      const res = await apiClient<{ data: ServiceArea }>(`/api/v1/admin/service-areas/${id}`, {
        method: "PATCH",
        json: patch,
        idempotencyKey: randomIdempotencyKey(),
      });
      setAreas((list) => list.map((a) => (a.id === id ? res.data : a)));
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        alert(err.body.message ?? "Update failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function removeRow(id: string) {
    if (!confirm("Remove this service area? Customers in this postcode will no longer be able to order.")) return;
    setBusy(true);
    try {
      await apiClient(`/api/v1/admin/service-areas/${id}`, { method: "DELETE" });
      setAreas((list) => list.filter((a) => a.id !== id));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="font-display text-[13px] italic text-clay">Delivery</div>
          <h2 className="mt-1 font-display text-[30px] text-ink">Delivery charges</h2>
          <p className="mt-1 max-w-xl text-[13px] text-ink-muted">
            One row per postcode prefix. Fees are in pence. ETAs in minutes. Leave a row disabled to stop serving that postcode without deleting it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-forest px-5 text-[12px] font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          <Plus className="h-3.5 w-3.5" /> {showAdd ? "Close" : "Add area"}
        </button>
      </div>

      {showAdd ? (
        <form onSubmit={createOne} className="mt-6 rounded-lg border hairline bg-paper p-5">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Postcode prefix</Label>
              <Input
                required
                placeholder="NE1"
                value={draft.postcode_prefix}
                onChange={(e) => setDraft({ ...draft, postcode_prefix: e.target.value.toUpperCase() })}
              />
              <FieldError>{errors.postcode_prefix?.[0]}</FieldError>
            </div>
            <NumField label="Standard fee (pence)" value={draft.delivery_fee_pence} onChange={(v) => setDraft({ ...draft, delivery_fee_pence: v ?? 0 })} error={errors.delivery_fee_pence?.[0]} required />
            <NumField label="Priority surcharge (pence)" value={draft.priority_fee_pence} onChange={(v) => setDraft({ ...draft, priority_fee_pence: v })} error={errors.priority_fee_pence?.[0]} />
            <NumField label="Super surcharge (pence)" value={draft.super_fee_pence} onChange={(v) => setDraft({ ...draft, super_fee_pence: v })} error={errors.super_fee_pence?.[0]} />
            <NumField label="Standard ETA (min)" value={draft.eta_standard_minutes} onChange={(v) => setDraft({ ...draft, eta_standard_minutes: v })} error={errors.eta_standard_minutes?.[0]} />
            <NumField label="Priority ETA (min)" value={draft.eta_priority_minutes} onChange={(v) => setDraft({ ...draft, eta_priority_minutes: v })} error={errors.eta_priority_minutes?.[0]} />
            <label className="col-span-full flex items-center gap-2 text-[13px] text-ink-soft">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                className="h-4 w-4 accent-forest"
              />
              Active
            </label>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-10 items-center rounded-full bg-forest px-5 text-[12px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
            >
              {busy ? "Adding…" : "Add area"}
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setErrors({}); setDraft(BLANK); }}
              className="text-[12px] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-lg border hairline bg-paper">
        <table className="w-full min-w-[980px] text-[13px]">
          <thead className="border-b hairline bg-cream-deep/50 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            <tr>
              <th className="px-5 py-3">Prefix</th>
              <th className="px-5 py-3">Std fee (p)</th>
              <th className="px-5 py-3">Priority (p)</th>
              <th className="px-5 py-3">Super (p)</th>
              <th className="px-5 py-3">Std ETA (m)</th>
              <th className="px-5 py-3">Priority ETA (m)</th>
              <th className="px-5 py-3">Active</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {areas.map((a) => (
              <Row key={a.id} area={a} onSave={(patch) => saveRow(a.id, patch)} onDelete={() => removeRow(a.id)} busy={busy} />
            ))}
            {areas.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center italic text-ink-muted">No service areas yet. Add one to start accepting orders.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Row({
  area, onSave, onDelete, busy,
}: {
  area: ServiceArea;
  onSave: (patch: Partial<ServiceArea>) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [draft, setDraft] = useState<ServiceArea>(area);
  const dirty = JSON.stringify(draft) !== JSON.stringify(area);

  return (
    <tr className="transition-colors hover:bg-cream-deep/40">
      <td className="px-5 py-2.5 font-display text-[14px] text-ink">
        <Input
          value={draft.postcode_prefix}
          onChange={(e) => setDraft({ ...draft, postcode_prefix: e.target.value.toUpperCase() })}
          className="h-9 w-24"
        />
      </td>
      <td className="px-5 py-2.5"><NumCell value={draft.delivery_fee_pence} onChange={(v) => setDraft({ ...draft, delivery_fee_pence: v ?? 0 })} /></td>
      <td className="px-5 py-2.5"><NumCell value={draft.priority_fee_pence} onChange={(v) => setDraft({ ...draft, priority_fee_pence: v })} /></td>
      <td className="px-5 py-2.5"><NumCell value={draft.super_fee_pence} onChange={(v) => setDraft({ ...draft, super_fee_pence: v })} /></td>
      <td className="px-5 py-2.5"><NumCell value={draft.eta_standard_minutes} onChange={(v) => setDraft({ ...draft, eta_standard_minutes: v })} /></td>
      <td className="px-5 py-2.5"><NumCell value={draft.eta_priority_minutes} onChange={(v) => setDraft({ ...draft, eta_priority_minutes: v })} /></td>
      <td className="px-5 py-2.5">
        <input
          type="checkbox"
          checked={draft.is_active}
          onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
          className="h-4 w-4 accent-forest"
        />
      </td>
      <td className="px-5 py-2.5">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            disabled={!dirty || busy}
            onClick={() => onSave({
              postcode_prefix: draft.postcode_prefix,
              delivery_fee_pence: draft.delivery_fee_pence,
              priority_fee_pence: draft.priority_fee_pence,
              super_fee_pence: draft.super_fee_pence,
              eta_standard_minutes: draft.eta_standard_minutes,
              eta_priority_minutes: draft.eta_priority_minutes,
              is_active: draft.is_active,
            })}
            className="inline-flex h-9 items-center gap-1 rounded-full bg-forest px-3.5 text-[11px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-40"
          >
            <Save className="h-3 w-3" /> Save
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border hairline bg-paper text-[#8B2A1D] transition-colors hover:bg-[#F4E2DE]"
            aria-label="Delete service area"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function NumCell({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <Input
      type="number"
      className="h-9 w-28"
      value={value === null || value === undefined ? "" : String(value)}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
    />
  );
}

function NumField({
  label, value, onChange, error, required = false,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        required={required}
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
      <FieldError>{error}</FieldError>
    </div>
  );
}

function byPrefix(a: ServiceArea, b: ServiceArea) {
  return a.postcode_prefix.localeCompare(b.postcode_prefix);
}
