"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Eyebrow } from "@/components/shop/eyebrow";
import { AuthFrame } from "@/components/shop/auth-frame";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", password_confirmation: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) {
        setErrors(body?.errors ?? { email: [body?.message ?? "Registration failed."] });
        return;
      }
      router.push("/account");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthFrame>
      <Eyebrow>Join us</Eyebrow>
      <h1 className="mt-3 text-[44px] font-extrabold tracking-tight text-ink">
        Create an account.
      </h1>
      <p className="mt-3 text-[14px] text-ink-muted">
        Save addresses, reorder favourites, and track deliveries in one place.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" autoComplete="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          <FieldError>{errors.name?.[0]}</FieldError>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
          <FieldError>{errors.email?.[0]}</FieldError>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <FieldError>{errors.phone?.[0]}</FieldError>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" required value={form.password} onChange={(e) => set("password", e.target.value)} />
            <FieldError>{errors.password?.[0]}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pc">Confirm</Label>
            <Input id="pc" type="password" autoComplete="new-password" required value={form.password_confirmation} onChange={(e) => set("password_confirmation", e.target.value)} />
          </div>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-yellow px-6 text-[14px] font-bold text-navy transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
        >
          {pending ? "Creating account…" : "Create account →"}
        </button>
      </form>

      <p className="mt-8 text-center text-[13px] text-ink-muted">
        Already with us? <Link href="/login" className="font-semibold text-brand underline underline-offset-2 hover:text-brand-deep">Sign in</Link>
      </p>
    </AuthFrame>
  );
}
