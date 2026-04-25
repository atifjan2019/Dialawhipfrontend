import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "catering_session";

type RouteGuard = { prefix: string; roles: string[] };

const GUARDS: RouteGuard[] = [
  { prefix: "/admin", roles: ["staff", "admin"] },
  { prefix: "/driver", roles: ["driver", "admin"] },
  { prefix: "/account", roles: ["customer", "staff", "admin", "driver"] },
];

function match(pathname: string): RouteGuard | null {
  return GUARDS.find((g) => pathname === g.prefix || pathname.startsWith(`${g.prefix}/`)) ?? null;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const guard = match(pathname);
  if (!guard) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const login = new URL("/login", req.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    const data = await res.json();
    const role = data?.data?.role as string | undefined;
    if (!role || !guard.roles.includes(role)) {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/driver/:path*", "/account/:path*"],
};
