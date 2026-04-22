"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient, ApiRequestError, randomIdempotencyKey } from "@/lib/api-client";
import { Input, Label, FieldError } from "@/components/ui/input";

export function AddDriverForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setCreated(null);
    setPending(true);
    try {
      await apiClient("/api/v1/admin/drivers", {
        method: "POST",
        json: form,
        idempotencyKey: randomIdempotencyKey(),
      });
      setCreated(form.name);
      setForm({ name: "", email: "", phone: "", password: "" });
      router.refresh();
    } catch (e: unknown) {
      if (e instanceof ApiRequestError) setErrors(e.body.errors ?? { email: [e.body.message] });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <FieldError>{errors.name?.[0]}</FieldError>
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <FieldError>{errors.email?.[0]}</FieldError>
      </div>
      <div className="space-y-1.5">
        <Label>Phone</Label>
        <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <Input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <FieldError>{errors.password?.[0]}</FieldError>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-forest px-6 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create driver"}
      </button>
      {created ? <p className="text-[12px] text-forest">Driver {created} created.</p> : null}
    </form>
  );
}
