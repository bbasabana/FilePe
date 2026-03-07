import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb, users } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";

function requireAdmin(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) return { session: null, response: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  if (session.role !== "admin") return { session: null, response: NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }) };
  return { session, response: null };
}

/** GET : liste des utilisateurs (admin uniquement). Ne renvoie pas les mots de passe. */
export async function GET(request: NextRequest) {
  const { response } = requireAdmin(request);
  if (response) return response;
  const db = getDb();
  const list = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      blocked: users.blocked,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.email));
  return NextResponse.json(list);
}

/** POST : créer un utilisateur (admin uniquement). */
export async function POST(request: NextRequest) {
  const { response } = requireAdmin(request);
  if (response) return response;
  let body: { email?: string; password?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "").trim();
  const role = body.role === "admin" || body.role === "juriste" ? body.role : "juriste";
  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
  }
  const db = getDb();
  const hash = await bcrypt.hash(password, 10);
  try {
    const [inserted] = await db
      .insert(users)
      .values({ email, passwordHash: hash, role, blocked: false })
      .returning({ id: users.id, email: users.email, role: users.role });
    return NextResponse.json(inserted);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }
    throw e;
  }
}
