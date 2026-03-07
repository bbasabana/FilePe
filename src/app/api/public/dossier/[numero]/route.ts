import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, dossiers, detenus } from "@/db";
import { normalizeAndValidateNumero } from "@/lib/numero-dossier";

/** Réponse minimale pour scan QR : numéro + nom (pas d’autres données). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ numero: string }> }
) {
  const numero = normalizeAndValidateNumero((await params).numero);
  if (!numero) {
    return NextResponse.json({ error: "Numéro invalide" }, { status: 400 });
  }
  const db = getDb();
  const [row] = await db
    .select({
      numeroDossier: dossiers.numeroDossier,
      nom: detenus.nom,
      prenom: detenus.prenom,
    })
    .from(dossiers)
    .leftJoin(detenus, eq(dossiers.id, detenus.dossierId))
    .where(eq(dossiers.numeroDossier, numero))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    numeroDossier: row.numeroDossier,
    nom: row.nom ?? "—",
    prenom: row.prenom ?? "—",
  });
}
