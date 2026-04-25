"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Eyebrow } from "@/components/shop/eyebrow";
import { AuthFrame } from "@/components/shop/auth-frame";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-20 text-center text-ink-muted">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

const HOME_BY_ROLE: Record<string, string> = {
  admin: "/admin",
  staff: "/admin",
  driver: "/driver",
  customer: "/account",
};

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setErrors(body?.errors ?? { email: [body?.message ?? "Login failed."] });
        return;
      }
      const role = body?.user?.role as string | undefined;
      const home = (role && HOME_BY_ROLE[role]) ?? "/account";
      // Privileged roles always land on their role home — a stray `next`
      // from a customer-facing page must not put an admin/driver on
      // /account by accident.
      const privileged = role === "admin" || role === "staff" || role === "driver";
      router.push(privileged ? home : (next ?? home));
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthFrame>
      <Eyebrow>Welcome back</Eyebrow>
      <h1 className="mt-3 text-[44px] font-extrabold tracking-tight text-ink">
        Sign in.
      </h1>
      <p className="mt-3 text-[14px] text-ink-muted">
        Your bag, your addresses and your past orders — right where you left them.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <FieldError>{errors.email?.[0]}</FieldError>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <FieldError>{errors.password?.[0]}</FieldError>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-yellow px-6 text-[14px] font-bold text-navy transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
        >
          {pending ? "Signing in…" : "Sign in →"}
        </button>
      </form>

      <p className="mt-8 text-center text-[13px] text-ink-muted">
        New customer? <Link href="/register" className="font-semibold text-brand underline underline-offset-2 hover:text-brand-deep">Create an account</Link>
      </p>
    </AuthFrame>
  );
}

