import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, planningsVehicules } from "@/db";
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
  let body: { dateSortie?: string; heure?: string; trajet?: string; observation?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }
  const db = getDb();
  const payload: { dateSortie?: string; heure?: string | null; trajet?: string | null; observation?: string | null } = {};
  if (body.dateSortie !== undefined) payload.dateSortie = body.dateSortie;
  if (body.heure !== undefined) payload.heure = body.heure?.trim() || null;
  if (body.trajet !== undefined) payload.trajet = body.trajet?.trim() || null;
  if (body.observation !== undefined) payload.observation = body.observation?.trim() || null;
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
  }
  const [row] = await db.update(planningsVehicules).set(payload).where(eq(planningsVehicules.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Planning introuvable" }, { status: 404 });
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
  const [row] = await db.delete(planningsVehicules).where(eq(planningsVehicules.id, id)).returning({ id: planningsVehicules.id });
  if (!row) return NextResponse.json({ error: "Planning introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
