import { NextRequest, NextResponse } from "next/server";
import {
  parseSessionToken,
  SESSION_COOKIE_NAME,
  clearSessionCookie,
} from "@/lib/auth-cookie";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = parseSessionToken(token);
  if (!user) {
    const res = NextResponse.json({ error: "Session invalide" }, { status: 401 });
    clearSessionCookie(res);
    return res;
  }

  return NextResponse.json({ user });
}
