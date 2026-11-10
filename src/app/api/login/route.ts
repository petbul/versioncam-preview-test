import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_VALUE,
  TEST_PASSWORD_SHA256,
  TEST_USER,
} from "@/lib/account";

/** The sign-in form posts here: a session cookie and the app, or back to the form. */
export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const given = createHash("sha256").update(password).digest();
  const expected = Buffer.from(TEST_PASSWORD_SHA256, "hex");
  const ok = email === TEST_USER && timingSafeEqual(given, expected);
  if (!ok) {
    return NextResponse.redirect(new URL("/login?failed=1", request.url), 303);
  }
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
  });
  return response;
}
