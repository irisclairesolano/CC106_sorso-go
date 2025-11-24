import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  // Get credentials from environment variables (required)
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    return NextResponse.json(
      { ok: false, message: "Server configuration error" },
      { status: 500 }
    );
  }

  if (email === expectedEmail && password === expectedPassword) {
    const res = NextResponse.json({ ok: true });

    // Set cookie correctly
    res.cookies.set("admin", "logged-in", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;
  }

  return NextResponse.json(
    { ok: false, message: "Invalid credentials" },
    { status: 401 }
  );
}
