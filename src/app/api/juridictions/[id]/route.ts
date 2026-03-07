import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, juridictions, parquets } from "@/db";
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
  let body: { nom?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }
  const nom = typeof body.nom === "string" ? body.nom.trim() : undefined;
  const code = body.code !== undefined ? (body.code === "" || body.code === null ? null : String(body.code).trim()) : undefined;
  if (!nom && code === undefined) {
    return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
  }
  if (nom === "") {
    return NextResponse.json({ error: "Le nom ne peut pas être vide" }, { status: 400 });
  }
  const db = getDb();
  const payload: { nom?: string; code?: string | null } = {};
  if (nom) payload.nom = nom;
  if (code !== undefined) payload.code = code;
  try {
    const [row] = await db
      .update(juridictions)
      .set(payload)
      .where(eq(juridictions.id, id))
      .returning();
    if (!row) {
      return NextResponse.json({ error: "Juridiction introuvable" }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Ce code existe déjà" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
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
  const linked = await db
    .select({ id: parquets.id })
    .from(parquets)
    .where(eq(parquets.juridictionId, id))
    .limit(1);
  if (linked.length > 0) {
    return NextResponse.json(
      { error: "Impossible de supprimer : des parquets sont rattachés à cette juridiction." },
      { status: 409 }
    );
  }
  const [row] = await db
    .delete(juridictions)
    .where(eq(juridictions.id, id))
    .returning({ id: juridictions.id });
  if (!row) {
    return NextResponse.json({ error: "Juridiction introuvable" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
