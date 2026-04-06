import { NextResponse } from "next/server";

const SITE_PASSWORD = "3207";
const COOKIE_NAME = "pc_unlock";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body?.password ?? "");

    if (password !== SITE_PASSWORD) {
      return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, "ok", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}

