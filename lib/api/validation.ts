import type { NextRequest } from "next/server";
import { z, ZodSchema } from "zod";

export async function parseJson<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const body = await req.json().catch(() => ({}));
  return schema.parse(body);
}

export function parseQuery<T>(req: NextRequest, schema: ZodSchema<T>): T {
  const obj: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => {
    obj[k] = v;
  });
  return schema.parse(obj);
}

export const intish = z.preprocess(
  (v) => (typeof v === "string" && v !== "" ? Number(v) : v),
  z.number().int(),
);

export const boolish = z.preprocess(
  (v) => (v === "true" || v === "1" ? true : v === "false" || v === "0" ? false : v),
  z.boolean(),
);

export const limitParam = z.preprocess(
  (v) => (typeof v === "string" && v !== "" ? Math.min(100, Math.max(1, Number(v) || 25)) : 25),
  z.number().int(),
);
