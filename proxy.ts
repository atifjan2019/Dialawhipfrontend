import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.next();

  const res = NextResponse.next();
  const sb = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (toSet) => {
        for (const c of toSet) res.cookies.set(c.name, c.value, c.options);
      },
    },
  });

  const { data } = await sb.auth.getUser();
  if (!data?.user) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  const role = (data.user.user_metadata?.role as string | undefined) ?? "customer";
  if (!guard.roles.includes(role)) {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/driver/:path*", "/account/:path*"],
};
