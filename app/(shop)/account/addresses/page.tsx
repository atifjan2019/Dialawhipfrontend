"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, ApiRequestError, randomIdempotencyKey } from "@/lib/api-client";
import type { Address } from "@/lib/types";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Eyebrow } from "@/components/shop/eyebrow";

const BLANK = { label: "Home", line1: "", line2: "", city: "Newcastle upon Tyne", postcode: "", is_default: false };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  function load() {
    apiClient<{ data: Address[] }>("/api/v1/me/addresses").then((r) => setAddresses(r.data));
  }
  useEffect(load, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setPending(true);
    try {
      await apiClient("/api/v1/me/addresses", {
        method: "POST",
        json: form,
        idempotencyKey: randomIdempotencyKey(),
      });
      setForm(BLANK);
      load();
    } catch (e: unknown) {
      if (e instanceof ApiRequestError) setErrors(e.body.errors ?? {});
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    await apiClient(`/api/v1/me/addresses/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14">
      <Link href="/account" className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-forest">
        ← Account
      </Link>
      <div className="mt-8">
        <Eyebrow>Saved locations</Eyebrow>
        <h1 className="mt-5 font-display text-[48px] leading-[1] text-ink md:text-[56px]">
          Your <span className="italic font-light text-forest">addresses</span>
        </h1>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 className="font-display text-[18px] text-ink">Saved</h2>
          <ul className="mt-4 space-y-3">
            {addresses.length === 0 ? (
              <li className="rounded-lg border hairline bg-paper p-6 text-[14px] text-ink-muted">
                No saved addresses yet. Add one to speed up future checkouts.
              </li>
            ) : null}
            {addresses.map((a) => (
              <li key={a.id} className="rounded-lg border hairline bg-paper p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[18px] text-ink">{a.label ?? "Address"}</span>
                      {a.is_default ? (
                        <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-forest">Default</span>
                      ) : null}
                    </div>
                    <div className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                      {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                      {a.city}, {a.postcode}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(a.id)}
                    className="text-[12px] font-medium text-ink-muted transition-colors hover:text-clay"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={save} className="h-fit space-y-4 rounded-lg border hairline bg-paper p-6">
          <div>
            <div className="font-display text-[13px] italic text-clay">Add new</div>
            <h2 className="mt-1 font-display text-[22px] text-ink">New address</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Postcode</Label>
              <Input value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value.toUpperCase() })} required />
              <FieldError>{errors.postcode?.[0]}</FieldError>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Line 1</Label>
            <Input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
            <FieldError>{errors.line1?.[0]}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label>Line 2</Label>
            <Input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <label className="flex items-center gap-2.5 text-[13px] text-ink-soft">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="h-4 w-4 accent-forest"
            />
            Set as default
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-forest px-6 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save address"}
          </button>
        </form>
      </div>
    </div>
  );
}
