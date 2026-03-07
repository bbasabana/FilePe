import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb, users } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";

function requireAdmin(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) return { session: null, response: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  if (session.role !== "admin") return { session: null, response: NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }) };
  return { session, response: null };
}

/** PATCH : modifier un utilisateur (bloquer, rôle, mot de passe) — admin uniquement. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = requireAdmin(request);
  if (response) return response;
  const { id } = await params;
  let body: { blocked?: boolean; role?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }
  const db = getDb();
  const payload: { blocked?: boolean; role?: "admin" | "juriste"; passwordHash?: string } = {};
  if (typeof body.blocked === "boolean") payload.blocked = body.blocked;
  if (body.role === "admin" || body.role === "juriste") payload.role = body.role;
  if (typeof body.password === "string" && body.password.trim().length >= 6) {
    payload.passwordHash = await bcrypt.hash(body.password.trim(), 10);
  }
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
  }
  const [updated] = await db.update(users).set(payload).where(eq(users.id, id)).returning({
    id: users.id,
    email: users.email,
    role: users.role,
    blocked: users.blocked,
  });
  if (!updated) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json(updated);
}

/** DELETE : supprimer un utilisateur — admin uniquement. Impossible de se supprimer soi-même. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = requireAdmin(request);
  if (response) return response;
  const { id } = await params;
  if (session!.id === id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
  }
  const db = getDb();
  const [deleted] = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
  if (!deleted) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
