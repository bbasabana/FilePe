import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, dossiers, pieceJointes } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";
import { normalizeAndValidateNumero } from "@/lib/numero-dossier";

const MAX_FILE_BASE64_LENGTH = 4 * 1024 * 1024; // ~4 MB en base64

/** GET : liste des pièces jointes du dossier (titre, file_name ; pas le contenu en liste). */
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
      id: pieceJointes.id,
      titre: pieceJointes.titre,
      fileName: pieceJointes.fileName,
      fileType: pieceJointes.fileType,
      createdAt: pieceJointes.createdAt,
    })
    .from(pieceJointes)
    .where(eq(pieceJointes.dossierId, dossier.id))
    .orderBy(pieceJointes.createdAt);

  return NextResponse.json(list);
}

/** POST : ajouter une pièce jointe (titre + fichier optionnel). */
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

  let body: { titre?: string; fileName?: string; fileType?: string; fileBase64?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const titre = String(body.titre ?? "").trim();
  if (!titre) {
    return NextResponse.json({ error: "Le titre du document est requis" }, { status: 400 });
  }

  const fileBase64 = typeof body.fileBase64 === "string" ? body.fileBase64.trim() : null;
  if (fileBase64 && fileBase64.length > MAX_FILE_BASE64_LENGTH) {
    return NextResponse.json({ error: "Fichier trop volumineux (max. ~4 Mo)" }, { status: 400 });
  }

  const [inserted] = await db
    .insert(pieceJointes)
    .values({
      dossierId: dossier.id,
      titre,
      fileName: body.fileName?.trim() || null,
      fileType: body.fileType?.trim() || null,
      fileBase64: fileBase64 || null,
    })
    .returning({ id: pieceJointes.id, titre: pieceJointes.titre, fileName: pieceJointes.fileName, createdAt: pieceJointes.createdAt });

  return NextResponse.json(inserted);
}
