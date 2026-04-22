import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "catering_session";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({ message: "Registration failed" }));
  if (!res.ok) return NextResponse.json(payload, { status: res.status });

  const token = payload?.data?.token as string | undefined;
  if (token) {
    const jar = await cookies();
    jar.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return NextResponse.json({ user: payload?.data?.user ?? null });
}
