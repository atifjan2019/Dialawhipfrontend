"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { useCart } from "@/lib/cart";
import { apiClient, ApiRequestError, randomIdempotencyKey } from "@/lib/api-client";
import type { Address, DeliveryTier, PricingResult, User } from "@/lib/types";
import { Eyebrow } from "@/components/shop/eyebrow";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [tier, setTier] = useState<DeliveryTier>("standard");
  const [statementAccepted, setStatementAccepted] = useState(false);
  const [n2oAccepted, setN2oAccepted] = useState(false);
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [newAddr, setNewAddr] = useState(false);
  const [addr, setAddr] = useState({ label: "Kitchen", line1: "", line2: "", city: "Newcastle upon Tyne", postcode: "" });

  const requiresId = pricing?.requires_id_verification ?? false;
  const isVerified = user?.verification_status === "verified";

  useEffect(() => {
    apiClient<{ data: User }>("/api/v1/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => setUser(null));

    apiClient<{ data: Address[] }>("/api/v1/me/addresses")
      .then((r) => {
        setAddresses(r.data);
        const def = r.data.find((a) => a.is_default) ?? r.data[0];
        if (def) setSelectedAddress(def.id);
        else setNewAddr(true);
      })
      .catch(() => setNewAddr(true));
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const address = addresses.find((a) => a.id === selectedAddress);
    apiClient<{ data: PricingResult }>("/api/v1/checkout/preview", {
      method: "POST",
      json: {
        items: items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id ?? null,
          quantity: i.quantity,
        })),
        postcode: address?.postcode ?? null,
        delivery_tier: tier,
      },
    })
      .then((r) => { setPricing(r.data); setError(null); })
      .catch((e: unknown) => {
        if (e instanceof ApiRequestError) setError(e.body.message);
      });
  }, [items, addresses, selectedAddress, tier]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setError(null);

    if (requiresId && !isVerified) {
      setError("Please complete ID verification before ordering age-restricted items.");
      return;
    }
    if (requiresId && (!statementAccepted || !n2oAccepted)) {
      setError("Please accept the statement of use and N₂O agreement.");
      return;
    }

    setPending(true);
    try {
      let addressId = selectedAddress;
      if (newAddr) {
        const created = await apiClient<{ data: Address }>("/api/v1/me/addresses", {
          method: "POST",
          json: addr,
          idempotencyKey: randomIdempotencyKey(),
        });
        addressId = created.data.id;
      }
      const res = await apiClient<{ data: { checkout_url: string; stripe_session_id: string } }>(
        "/api/v1/checkout/session",
        {
          method: "POST",
          idempotencyKey: randomIdempotencyKey(),
          json: {
            items: items.map((i) => ({
              product_id: i.product_id,
              variant_id: i.variant_id ?? null,
              quantity: i.quantity,
            })),
            address_id: addressId,
            delivery_tier: tier,
            statement_of_use_accepted: statementAccepted,
            n2o_agreement_accepted: n2oAccepted,
            customer_notes: notes || null,
          },
        },
      );
      window.location.href = res.data.checkout_url;
    } catch (e: unknown) {
      if (e instanceof ApiRequestError) {
        setErrors(e.body.errors ?? {});
        setError(e.body.message);
      } else {
        setError("Unable to start checkout.");
      }
    } finally {
      setPending(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-28 text-center">
        <h1 className="font-display text-[56px] italic font-light text-forest">Your bag is empty.</h1>
        <Link
          href="/shop"
          className="mt-10 inline-flex h-12 items-center rounded-full bg-forest px-8 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  const tierEtas = pricing?.service_area;
  const etaStd = tierEtas?.eta_standard_minutes ?? null;
  const etaPri = tierEtas?.eta_priority_minutes ?? null;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14">
      <Eyebrow>Step 2 of 2</Eyebrow>
      <h1 className="mt-5 font-display text-[48px] leading-[1] text-ink md:text-[64px]">
        Almost <span className="italic font-light text-forest">there</span>.
      </h1>

      <form onSubmit={onSubmit} className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <Section step="01" title="Where should we deliver?">
            {addresses.length > 0 && !newAddr ? (
              <div className="space-y-2.5">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-4 rounded-lg border p-5 transition-all ${
                      selectedAddress === a.id
                        ? "border-forest bg-paper shadow-[0_1px_0_0_var(--color-forest)]"
                        : "hairline bg-paper hover:border-ink/25"
                    }`}
                  >
                    <input
                      type="radio"
                      name="addr"
                      value={a.id}
                      checked={selectedAddress === a.id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="mt-1 accent-forest"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[17px] text-ink">{a.label ?? "Address"}</span>
                        {a.is_default ? <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">Default</span> : null}
                      </div>
                      <div className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                        {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                        {a.city}, {a.postcode}
                      </div>
                    </div>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setNewAddr(true)}
                  className="mt-2 text-[13px] font-medium text-forest transition-colors hover:text-forest-deep"
                >
                  + Add new address
                </button>
              </div>
            ) : (
              <div className="space-y-4 rounded-lg border hairline bg-paper p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Label">
                    <Input value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} />
                  </Field>
                  <Field label="Postcode">
                    <Input value={addr.postcode} onChange={(e) => setAddr({ ...addr, postcode: e.target.value.toUpperCase() })} required />
                  </Field>
                </div>
                <Field label="Address line 1">
                  <Input value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} required />
                </Field>
                <Field label="Address line 2">
                  <Input value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} />
                </Field>
                <Field label="City">
                  <Input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} required />
                </Field>
                {addresses.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setNewAddr(false)}
                    className="text-[13px] font-medium text-forest hover:text-forest-deep"
                  >
                    ← Choose existing
                  </button>
                ) : null}
              </div>
            )}
          </Section>

          <Section step="02" title="How fast?">
            <div className="grid gap-2.5 sm:grid-cols-3">
              <TierCard
                tier="standard"
                current={tier}
                onSelect={setTier}
                name="Standard"
                price={0}
                eta={etaStd ? `${etaStd} min` : "18–35 min"}
                blurb="Our default."
              />
              <TierCard
                tier="priority"
                current={tier}
                onSelect={setTier}
                name="Priority"
                price={tierEtas?.priority_fee_pence ?? 500}
                eta={etaPri ? `${etaPri} min` : "10–20 min"}
                blurb="Jumps the queue."
                highlighted
              />
              <TierCard
                tier="super"
                current={tier}
                onSelect={setTier}
                name="Super"
                price={tierEtas?.super_fee_pence ?? 1500}
                eta="8–15 min"
                blurb="Dedicated rider."
              />
            </div>
          </Section>

          {requiresId ? (
            <Section step="03" title="ID & compliance">
              <div className="space-y-4 rounded-xl border hairline bg-paper p-6">
                {!user ? (
                  <div className="rounded-lg bg-cream-deep/50 p-4 text-[13px] text-ink-soft">
                    Your bag contains age-restricted items.{" "}
                    <Link href="/login?next=/checkout" className="font-medium text-forest underline underline-offset-4">Sign in</Link>
                    {" or "}
                    <Link href="/register" className="font-medium text-forest underline underline-offset-4">register</Link>{" "}
                    to continue.
                  </div>
                ) : !isVerified ? (
                  <div className="rounded-lg border border-clay/40 bg-butter/20 p-4 text-[13px]">
                    <div className="font-medium text-ink">ID verification required</div>
                    <div className="mt-1 text-ink-muted">
                      Upload a government-issued ID once — approved inside ten minutes.{" "}
                      <Link href="/account/verification" className="font-medium text-forest underline underline-offset-4">
                        Start verification →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg bg-forest px-4 py-3 text-cream">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-butter font-display text-[12px] font-semibold text-forest">✓</span>
                    <div className="text-[13px] font-medium">Your account is verified</div>
                  </div>
                )}

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border hairline bg-cream-deep/30 p-4 text-[13px] text-ink-soft">
                  <input
                    type="checkbox"
                    checked={statementAccepted}
                    onChange={(e) => setStatementAccepted(e.target.checked)}
                    className="mt-1 accent-forest"
                  />
                  <span>
                    <strong className="text-ink">Statement of use.</strong> I confirm I am purchasing these products
                    exclusively for use in the preparation of food and beverages. I am 18 or older. I will not
                    consume, inhale, resell or otherwise misuse the product.
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border hairline bg-cream-deep/30 p-4 text-[13px] text-ink-soft">
                  <input
                    type="checkbox"
                    checked={n2oAccepted}
                    onChange={(e) => setN2oAccepted(e.target.checked)}
                    className="mt-1 accent-forest"
                  />
                  <span>
                    I have read and agree to the{" "}
                    <Link href="/legal/n2o-agreement" target="_blank" className="font-medium text-forest underline underline-offset-4">
                      N₂O chargers agreement
                    </Link>{" "}
                    and accept its binding terms.
                  </span>
                </label>
              </div>
            </Section>
          ) : null}

          <Section step={requiresId ? "04" : "03"} title="Anything we should know?">
            <div className="rounded-lg border hairline bg-paper p-6">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gate codes, buzzer details, doorman instructions…" />
            </div>
          </Section>

          {error ? (
            <div className="rounded-lg border border-[#C87863]/40 bg-[#F3D4CC]/60 p-4 text-[13px] text-[#8B2A1D]">
              {error}
            </div>
          ) : null}
        </div>

        <aside className="h-fit space-y-5 lg:sticky lg:top-24">
          <div className="rounded-lg border hairline bg-paper p-6">
            <h2 className="font-display text-[22px] text-ink">Your order</h2>
            <ul className="mt-5 space-y-3 text-[13px]">
              {items.map((i) => (
                <li key={`${i.product_id}::${i.variant_id ?? ""}`} className="flex justify-between gap-4">
                  <span className="text-ink-soft">
                    <span className="font-medium text-ink">{i.quantity} ×</span> {i.name}
                    {i.variant_label ? (
                      <span className="ml-1 text-[11px] uppercase tracking-[0.12em] text-clay">· {i.variant_label}</span>
                    ) : null}
                  </span>
                  <Money pence={i.unit_price_pence * i.quantity} className="shrink-0 text-ink" />
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2 border-t hairline pt-5 text-[13px]">
              <Row label="Subtotal"><Money pence={pricing?.subtotal_pence ?? 0} /></Row>
              <Row label={`Delivery (${tier})`}><Money pence={pricing?.delivery_fee_pence ?? 0} /></Row>
              {pricing && pricing.vat_pence > 0 ? <Row label="VAT"><Money pence={pricing.vat_pence} /></Row> : null}
            </div>

            <div className="mt-5 flex items-baseline justify-between border-t hairline pt-5">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">Total</span>
              <Money pence={pricing?.total_pence ?? 0} className="font-display text-[28px] text-forest" />
            </div>

            <button
              type="submit"
              disabled={pending || !pricing || (requiresId && !isVerified)}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-forest px-6 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
            >
              {pending ? "Starting secure checkout…" : "Pay securely →"}
            </button>
            <p className="mt-3 text-center text-[11px] text-ink-muted">
              Powered by Stripe · Klarna · Apple Pay · Cash on delivery
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function TierCard({
  tier, current, onSelect, name, price, eta, blurb, highlighted,
}: {
  tier: DeliveryTier;
  current: DeliveryTier;
  onSelect: (t: DeliveryTier) => void;
  name: string;
  price: number;
  eta: string;
  blurb: string;
  highlighted?: boolean;
}) {
  const active = current === tier;
  return (
    <button
      type="button"
      onClick={() => onSelect(tier)}
      className={`relative rounded-xl border p-5 text-left transition-all ${
        active
          ? "border-forest bg-paper shadow-[0_8px_20px_-10px_rgba(10,22,40,0.25)]"
          : "hairline bg-paper hover:border-ink/25"
      }`}
    >
      {highlighted && !active ? (
        <span className="absolute -top-2 left-5 rounded-full bg-butter px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-forest">
          Popular
        </span>
      ) : null}
      <div className="flex items-baseline justify-between">
        <span className="font-display text-[17px] text-ink">{name}</span>
        <span className="text-[12px] font-medium text-clay">
          {price === 0 ? "Free" : <>+<Money pence={price} /></>}
        </span>
      </div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        {eta}
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">{blurb}</p>
    </button>
  );
}

function Section({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-baseline gap-4">
        <span className="font-display text-[13px] italic text-clay">№ {step}</span>
        <h2 className="font-display text-[26px] leading-tight text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="text-ink">{children}</span>
    </div>
  );
}
