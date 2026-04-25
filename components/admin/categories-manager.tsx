"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiRequestError } from "@/lib/api-client";
import { Input, Label, FieldError } from "@/components/ui/input";
import type { Category } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoriesManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Category[]>(initial);
  const [draft, setDraft] = useState({ name: "", slug: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setPending(true);
    try {
      const res = await apiClient<{ data: Category }>("/api/v1/admin/categories", {
        method: "POST",
        json: {
          name: draft.name,
          slug: draft.slug || slugify(draft.name),
          sort_order: items.length,
          is_active: true,
        },
      });
      setItems((cur) => [...cur, res.data]);
      setDraft({ name: "", slug: "" });
      router.refresh();
    } catch (e) {
      if (e instanceof ApiRequestError) {
        setErrors(e.body.errors ?? { name: [e.body.message] });
      }
    } finally {
      setPending(false);
    }
  }

  async function onToggleActive(c: Category) {
    const next = !c.is_active;
    setItems((cur) => cur.map((x) => (x.id === c.id ? { ...x, is_active: next } : x)));
    try {
      await apiClient(`/api/v1/admin/categories/${c.id}`, {
        method: "PATCH",
        json: { is_active: next },
      });
    } catch {
      setItems((cur) => cur.map((x) => (x.id === c.id ? { ...x, is_active: !next } : x)));
    }
  }

  async function onDelete(c: Category) {
    if (!confirm(`Delete "${c.name}"?`)) return;
    try {
      await apiClient(`/api/v1/admin/categories/${c.id}`, { method: "DELETE" });
      setItems((cur) => cur.filter((x) => x.id !== c.id));
      router.refresh();
    } catch (e) {
      if (e instanceof ApiRequestError) {
        alert(e.body.message);
      }
    }
  }

  return (
    <div className="mt-10 space-y-8">
      <form onSubmit={onCreate} className="rounded-lg border hairline bg-paper p-6">
        <h2 className="font-display text-[20px] text-ink">Add a category</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Cream chargers"
            />
            <FieldError>{errors.name?.[0]}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              placeholder={draft.name ? slugify(draft.name) : "cream-chargers"}
            />
            <FieldError>{errors.slug?.[0]}</FieldError>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-forest px-5 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border hairline bg-paper">
        <table className="w-full text-[13px]">
          <thead className="border-b hairline bg-cream-deep/50 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3">Active</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {items.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3.5 font-display text-[14px] text-ink">{c.name}</td>
                <td className="px-5 py-3.5 font-mono text-ink-muted">{c.slug}</td>
                <td className="px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => onToggleActive(c)}
                    className={
                      c.is_active
                        ? "rounded-full bg-forest/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-forest"
                        : "rounded-full bg-stone-soft px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-ink-muted"
                    }
                  >
                    {c.is_active ? "Active" : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(c)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-cream-deep hover:text-clay"
                    aria-label={`Delete ${c.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center italic text-ink-muted">
                  No categories yet — add your first one above.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
