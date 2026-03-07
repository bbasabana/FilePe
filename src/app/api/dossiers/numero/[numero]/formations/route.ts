import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, dossiers, formations } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";
import { normalizeAndValidateNumero } from "@/lib/numero-dossier";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ numero: string }> }
) {
  const session = getSessionFromRequest(_request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const numero = normalizeAndValidateNumero((await params).numero);
  if (!numero) return NextResponse.json({ error: "Numéro de dossier invalide" }, { status: 400 });
  const db = getDb();

  const [dossier] = await db.select({ id: dossiers.id }).from(dossiers).where(eq(dossiers.numeroDossier, numero)).limit(1);
  if (!dossier) {
    return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  }

  const list = await db
    .select({
      id: formations.id,
      intitule: formations.intitule,
      organisme: formations.organisme,
      dateDebut: formations.dateDebut,
      dateFin: formations.dateFin,
      observation: formations.observation,
    })
    .from(formations)
    .where(eq(formations.dossierId, dossier.id))
    .orderBy(formations.createdAt);

  return NextResponse.json(list);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ numero: string }> }
) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const numero = normalizeAndValidateNumero((await params).numero);
  if (!numero) return NextResponse.json({ error: "Numéro de dossier invalide" }, { status: 400 });
  const db = getDb();

  const [dossier] = await db.select({ id: dossiers.id }).from(dossiers).where(eq(dossiers.numeroDossier, numero)).limit(1);
  if (!dossier) {
    return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  }

  let body: { intitule?: string; organisme?: string; dateDebut?: string | null; dateFin?: string | null; observation?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const intitule = String(body.intitule ?? "").trim();
  if (!intitule) {
    return NextResponse.json({ error: "L'intitulé est requis" }, { status: 400 });
  }

  const [row] = await db
    .insert(formations)
    .values({
      dossierId: dossier.id,
      intitule,
      organisme: body.organisme?.trim() || null,
      dateDebut: body.dateDebut || null,
      dateFin: body.dateFin || null,
      observation: body.observation?.trim() || null,
    })
    .returning({
      id: formations.id,
      intitule: formations.intitule,
      organisme: formations.organisme,
      dateDebut: formations.dateDebut,
      dateFin: formations.dateFin,
      observation: formations.observation,
    });

  return NextResponse.json(row);
}
