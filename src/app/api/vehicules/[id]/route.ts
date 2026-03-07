import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, vehicules } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;
  let body: { immatriculation?: string; type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }
  const db = getDb();
  const payload: { immatriculation?: string; type?: string | null } = {};
  if (body.immatriculation !== undefined) payload.immatriculation = body.immatriculation.trim();
  if (body.type !== undefined) payload.type = body.type?.trim() || null;
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
  }
  const [row] = await db.update(vehicules).set(payload).where(eq(vehicules.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(_request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;
  const db = getDb();
  const [row] = await db.delete(vehicules).where(eq(vehicules.id, id)).returning({ id: vehicules.id });
  if (!row) return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
