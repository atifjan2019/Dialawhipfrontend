import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "catering_session";

const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding", "upgrade", "host", "content-length",
]);

async function forward(req: NextRequest, path: string[]): Promise<NextResponse> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  const url = new URL(`${API_URL}/api/${path.join("/")}`);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const headers = new Headers();
  req.headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase()) && k.toLowerCase() !== "cookie") headers.set(k, v);
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

  const res = await fetch(url.toString(), init);
  const body = await res.arrayBuffer();

  const out = new NextResponse(body, { status: res.status });
  res.headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase()) && k.toLowerCase() !== "set-cookie") {
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
