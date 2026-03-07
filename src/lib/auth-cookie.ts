import { NextRequest, NextResponse } from "next/server";
import type { AuthUser } from "@/store/auth-store";

export const SESSION_COOKIE_NAME = "filepe_session";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 jours

export function createSessionToken(user: AuthUser): string {
  return Buffer.from(
    JSON.stringify({ sub: user.id, email: user.email, role: user.role })
  ).toString("base64url");
}

export function parseSessionToken(token: string): AuthUser | null {
  try {
    const json = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8")
    ) as { sub: string; email: string; role: string };
    if (typeof json.sub === "string" && typeof json.email === "string" && typeof json.role === "string") {
      return { id: json.sub, email: json.email, role: json.role as AuthUser["role"] };
    }
  } catch {
    // invalid token
  }
  return null;
}

export function setSessionCookie(response: NextResponse, user: AuthUser): void {
  const token = createSessionToken(user);
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function getSessionFromRequest(request: NextRequest): AuthUser | null {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? parseSessionToken(token) : null;
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
