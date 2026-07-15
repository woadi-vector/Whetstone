import { NextResponse } from "next/server";
import { z } from "zod";
import { DEV_GATE_COOKIE_NAME, DEV_GATE_COOKIE_VALUE } from "@/lib/dev-gate";

const requestSchema = z.object({ code: z.string().min(1) });

// TODO(auth): Remove this temporary development-only door when Supabase auth resumes.
export async function POST(request: Request) {
  const body = requestSchema.safeParse(await request.json().catch(() => null));
  const expectedCode = process.env.DEV_GATE_CODE;
  if (!expectedCode) {
    return NextResponse.json({ error: "DEV_GATE_CODE is not configured." }, { status: 500 });
  }
  if (!body.success || body.data.code !== expectedCode) {
    return NextResponse.json({ error: "Invalid passcode." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEV_GATE_COOKIE_NAME, DEV_GATE_COOKIE_VALUE, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
