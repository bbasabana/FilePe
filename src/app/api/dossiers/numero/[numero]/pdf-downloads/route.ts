import { NextRequest, NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { getDb, dossiers, pdfDownloads } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";
import { normalizeAndValidateNumero } from "@/lib/numero-dossier";

/** GET : nombre de téléchargements et liste des derniers (date, heure, utilisateur). */
export async function GET(
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

  const list = await db
    .select({
      downloadedAt: pdfDownloads.downloadedAt,
      downloadedBy: pdfDownloads.downloadedBy,
    })
    .from(pdfDownloads)
    .where(eq(pdfDownloads.dossierId, dossier.id))
    .orderBy(desc(pdfDownloads.downloadedAt))
    .limit(50);

  const [{ total: totalCount }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(pdfDownloads)
    .where(eq(pdfDownloads.dossierId, dossier.id));

  return NextResponse.json({
    total: totalCount ?? 0,
    items: list.map((r) => ({
      date: r.downloadedAt ? new Date(r.downloadedAt).toLocaleDateString("fr-FR") : null,
      time: r.downloadedAt ? new Date(r.downloadedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null,
      downloadedAt: r.downloadedAt,
      downloadedBy: r.downloadedBy ?? null,
    })),
  });
}

/** POST : enregistre un téléchargement PDF (appelé avant de générer le PDF). */
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

  await db.insert(pdfDownloads).values({
    dossierId: dossier.id,
    downloadedBy: session.email ?? null,
  });

  return NextResponse.json({ ok: true });
}
