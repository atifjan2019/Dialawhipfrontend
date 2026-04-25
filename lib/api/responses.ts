import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function noBody(status = 200) {
  return NextResponse.json({}, { status });
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ message, ...extra }, { status });
}

export function unauthorized() {
  return fail("Unauthenticated", 401);
}

export function forbidden() {
  return fail("Forbidden", 403);
}

export function notFound(message = "Not found") {
  return fail(message, 404);
}

export function validationError(errors: Record<string, string[]>, message = "Validation failed") {
  return NextResponse.json({ message, errors }, { status: 422 });
}

export function fromZodError(err: ZodError) {
  const errors: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const path = issue.path.length ? issue.path.join(".") : "_";
    (errors[path] ||= []).push(issue.message);
  }
  return validationError(errors);
}

// Wraps a route handler. Catches uncaught errors and converts Zod errors.
export function handle<T extends unknown[]>(
  fn: (...args: T) => Promise<Response> | Response,
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ZodError) return fromZodError(err);
      if (err instanceof HttpError) return fail(err.message, err.status, err.extra);
      console.error("[api] uncaught", err);
      const msg = err instanceof Error ? err.message : "Internal server error";
      return fail(msg, 500);
    }
  };
}

export class HttpError extends Error {
  constructor(public status: number, message: string, public extra?: Record<string, unknown>) {
    super(message);
  }
}
