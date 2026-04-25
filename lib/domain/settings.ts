import { supabaseAdmin } from "../supabase/admin";
import { SETTINGS, PUBLIC_KEYS, getMeta, coerce } from "./settings-registry";

let cache: { at: number; flat: Record<string, unknown> } | null = null;
const TTL_MS = 60_000;

async function loadFlat(): Promise<Record<string, unknown>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.flat;
  const admin = supabaseAdmin();
  const { data } = await admin.from("settings").select("key,value");
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  for (const def of SETTINGS) if (!(def.key in map) && def.default !== undefined) map[def.key] = def.default;
  cache = { at: Date.now(), flat: map };
  return map;
}

export function clearSettingsCache() { cache = null; }

export async function getSetting<T = unknown>(key: string, fallback?: T): Promise<T> {
  const map = await loadFlat();
  const v = map[key];
  return (v === undefined || v === null ? fallback : v) as T;
}

export async function publicSettings(): Promise<Record<string, unknown>> {
  const map = await loadFlat();
  const out: Record<string, unknown> = {};
  for (const k of PUBLIC_KEYS) out[k] = map[k] ?? null;
  return out;
}

export async function allFlat(): Promise<Record<string, unknown>> {
  return loadFlat();
}

export async function allGrouped() {
  const flat = await loadFlat();
  const groups: Record<string, Array<{ key: string; label: string; type: string; public: boolean; value: unknown }>> = {};
  for (const def of SETTINGS) {
    (groups[def.group] ||= []).push({
      key: def.key, label: def.label, type: def.type, public: def.public,
      value: flat[def.key] ?? null,
    });
  }
  return { groups, flat };
}

export async function updateMany(pairs: Record<string, unknown>): Promise<string[]> {
  const admin = supabaseAdmin();
  const updated: string[] = [];
  const rows = Object.entries(pairs)
    .filter(([k]) => !!getMeta(k))
    .map(([k, v]) => ({ key: k, value: coerce(k, v) }));
  if (rows.length === 0) return [];
  const { error } = await admin.from("settings").upsert(rows, { onConflict: "key" });
  if (error) throw error;
  for (const r of rows) updated.push(r.key);
  clearSettingsCache();
  return updated;
}

export async function updateOne(key: string, value: unknown): Promise<unknown> {
  if (!getMeta(key)) throw new Error(`Unknown setting: ${key}`);
  const admin = supabaseAdmin();
  const coerced = coerce(key, value);
  const { error } = await admin.from("settings").upsert({ key, value: coerced }, { onConflict: "key" });
  if (error) throw error;
  clearSettingsCache();
  return coerced;
}
