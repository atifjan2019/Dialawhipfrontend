import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Where the Laravel backend lives. The Next.js proxy forwards every
// /api/proxy/* request to ${API_URL}/api/*  e.g.
//   /api/proxy/v1/admin/settings  ->  http://127.0.0.1:8000/api/v1/admin/settings
const API_URL = (process.env.API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "catering_session";

const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding", "upgrade", "host", "content-length",
]);

async function forward(req: NextRequest, path: string[]): Promise<NextResponse> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  const target = `${API_URL}/api/${path.join("/")}`;
  const url = new URL(target);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const headers = new Headers();
  req.headers.forEach((v, k) => {
    const kl = k.toLowerCase();
    if (!HOP_BY_HOP.has(kl) && kl !== "cookie") headers.set(k, v);
  });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), init);
  } catch (err) {
    // Most common cause: Laravel is not running on API_URL.
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        message: `Upstream backend unreachable at ${API_URL}. Is 'php artisan serve' running?`,
        code: "upstream_unreachable",
        detail: message,
      },
      { status: 502 },
    );
  }

  const body = await res.arrayBuffer();
  const out = new NextResponse(body, { status: res.status });
  res.headers.forEach((v, k) => {
    const kl = k.toLowerCase();
    if (!HOP_BY_HOP.has(kl) && kl !== "set-cookie") {
      out.headers.set(k, v);
    }
  });
  return out;
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: Ctx) { return forward(req, (await params).path); }
export async function POST(req: NextRequest, { params }: Ctx) { return forward(req, (await params).path); }
export async function PUT(req: NextRequest, { params }: Ctx) { return forward(req, (await params).path); }
export async function PATCH(req: NextRequest, { params }: Ctx) { return forward(req, (await params).path); }
export async function DELETE(req: NextRequest, { params }: Ctx) { return forward(req, (await params).path); }
