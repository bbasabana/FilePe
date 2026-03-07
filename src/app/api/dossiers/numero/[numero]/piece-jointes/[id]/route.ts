import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, dossiers, pieceJointes } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";
import { normalizeAndValidateNumero } from "@/lib/numero-dossier";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** DELETE : supprimer une pièce jointe (isolée au dossier = un seul détenu/prévenu). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ numero: string; id: string }> }
) {
  const session = getSessionFromRequest(_request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { numero, id } = await params;
  if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  const numeroNorm = normalizeAndValidateNumero(numero);
  if (!numeroNorm) return NextResponse.json({ error: "Numéro de dossier invalide" }, { status: 400 });
  const db = getDb();

  const [dossier] = await db.select({ id: dossiers.id }).from(dossiers).where(eq(dossiers.numeroDossier, numeroNorm)).limit(1);
  if (!dossier) {
    return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  }

  const [deleted] = await db
    .delete(pieceJointes)
    .where(and(eq(pieceJointes.id, id), eq(pieceJointes.dossierId, dossier.id)))
    .returning({ id: pieceJointes.id });

  if (!deleted) {
    return NextResponse.json({ error: "Pièce jointe introuvable" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

/** GET : télécharger le fichier (retourne le contenu base64 ou 404). Isolation par dossier. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ numero: string; id: string }> }
) {
  const session = getSessionFromRequest(_request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { numero, id } = await params;
  if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  const numeroNorm = normalizeAndValidateNumero(numero);
  if (!numeroNorm) return NextResponse.json({ error: "Numéro de dossier invalide" }, { status: 400 });
  const db = getDb();

  const [dossier] = await db.select({ id: dossiers.id }).from(dossiers).where(eq(dossiers.numeroDossier, numeroNorm)).limit(1);
  if (!dossier) {
    return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  }

  const [row] = await db
    .select({ titre: pieceJointes.titre, fileName: pieceJointes.fileName, fileType: pieceJointes.fileType, fileBase64: pieceJointes.fileBase64 })
    .from(pieceJointes)
    .where(and(eq(pieceJointes.dossierId, dossier.id), eq(pieceJointes.id, id)))
    .limit(1);

  if (!row || !row.fileBase64) {
    return NextResponse.json({ error: "Fichier non disponible" }, { status: 404 });
  }

  return NextResponse.json({
    titre: row.titre,
    fileName: row.fileName,
    fileType: row.fileType,
    fileBase64: row.fileBase64,
  });
}
