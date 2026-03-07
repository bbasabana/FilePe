import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, dossiers, detenus, juridictions, parquets } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(_request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;
  const db = getDb();

  const [row] = await db
    .select({
      id: dossiers.id,
      numeroDossier: dossiers.numeroDossier,
      dateEntree: dossiers.dateEntree,
      juridictionId: dossiers.juridictionId,
      parquetId: dossiers.parquetId,
      juridictionBasParquet: dossiers.juridictionBasParquet,
      prevention: dossiers.prevention,
      observation: dossiers.observation,
      juridictionNom: juridictions.nom,
      parquetNom: parquets.nom,
      detenuId: detenus.id,
      categorie: detenus.categorie,
      nom: detenus.nom,
      prenom: detenus.prenom,
      poste: detenus.poste,
      lieuNaissance: detenus.lieuNaissance,
      dateNaissance: detenus.dateNaissance,
      nationalite: detenus.nationalite,
      adresse: detenus.adresse,
      matricule: detenus.matricule,
      grade: detenus.grade,
      fonction: detenus.fonction,
      unite: detenus.unite,
      detachement: detenus.detachement,
      etatCivil: detenus.etatCivil,
      status: detenus.status,
    })
    .from(dossiers)
    .leftJoin(detenus, eq(dossiers.id, detenus.dossierId))
    .leftJoin(juridictions, eq(dossiers.juridictionId, juridictions.id))
    .leftJoin(parquets, eq(dossiers.parquetId, parquets.id))
    .where(eq(dossiers.id, id))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    numeroDossier: row.numeroDossier,
    dateEntree: row.dateEntree,
    juridictionId: row.juridictionId,
    parquetId: row.parquetId,
    juridictionNom: row.juridictionNom ?? null,
    parquetNom: row.parquetNom ?? null,
    juridictionBasParquet: row.juridictionBasParquet,
    prevention: row.prevention,
    observation: row.observation,
    detenu: row.detenuId
      ? {
          id: row.detenuId,
          categorie: row.categorie,
          nom: row.nom,
          prenom: row.prenom,
          poste: row.poste,
          lieuNaissance: row.lieuNaissance,
          dateNaissance: row.dateNaissance,
          nationalite: row.nationalite,
          adresse: row.adresse,
          matricule: row.matricule,
          grade: row.grade,
          fonction: row.fonction,
          unite: row.unite,
          detachement: row.detachement,
          etatCivil: row.etatCivil,
          status: row.status,
        }
      : null,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;
  const db = getDb();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const dossierPayload: {
    numeroDossier?: string;
    dateEntree?: string;
    juridictionId?: string | null;
    parquetId?: string | null;
    juridictionBasParquet?: string | null;
    prevention?: string;
    observation?: string | null;
  } = {};
  if (typeof body.numeroDossier === "string") dossierPayload.numeroDossier = body.numeroDossier.trim();
  if (typeof body.dateEntree === "string") dossierPayload.dateEntree = body.dateEntree;
  if (body.juridictionId !== undefined) dossierPayload.juridictionId = body.juridictionId as string | null;
  if (body.parquetId !== undefined) dossierPayload.parquetId = body.parquetId as string | null;
  if (body.juridictionBasParquet !== undefined) dossierPayload.juridictionBasParquet = (body.juridictionBasParquet as string)?.trim() || null;
  if (typeof body.prevention === "string") dossierPayload.prevention = body.prevention.trim();
  if (body.observation !== undefined) dossierPayload.observation = (body.observation as string)?.trim() || null;

  const detenuPayload: {
    categorie?: "civil" | "policier" | "militaire";
    nom?: string;
    prenom?: string;
    poste?: string | null;
    lieuNaissance?: string | null;
    dateNaissance?: string | null;
    nationalite?: string | null;
    adresse?: string | null;
    matricule?: string | null;
    grade?: string | null;
    fonction?: string | null;
    unite?: string | null;
    detachement?: string | null;
    etatCivil?: "marie" | "celibataire" | "veuf" | null;
    status?: "prevenu" | "detenu" | "autre" | null;
  } = {};
  if (body.categorie === "civil" || body.categorie === "policier" || body.categorie === "militaire") detenuPayload.categorie = body.categorie;
  if (typeof body.nom === "string") detenuPayload.nom = body.nom.trim();
  if (typeof body.prenom === "string") detenuPayload.prenom = body.prenom.trim();
  if (body.poste !== undefined) detenuPayload.poste = (body.poste as string)?.trim() || null;
  if (body.lieuNaissance !== undefined) detenuPayload.lieuNaissance = (body.lieuNaissance as string)?.trim() || null;
  if (body.dateNaissance !== undefined) detenuPayload.dateNaissance = (body.dateNaissance as string) || null;
  if (body.nationalite !== undefined) detenuPayload.nationalite = (body.nationalite as string)?.trim() || null;
  if (body.adresse !== undefined) detenuPayload.adresse = (body.adresse as string)?.trim() || null;
  if (body.matricule !== undefined) detenuPayload.matricule = (body.matricule as string)?.trim() || null;
  if (body.grade !== undefined) detenuPayload.grade = (body.grade as string)?.trim() || null;
  if (body.fonction !== undefined) detenuPayload.fonction = (body.fonction as string)?.trim() || null;
  if (body.unite !== undefined) detenuPayload.unite = (body.unite as string)?.trim() || null;
  if (body.detachement !== undefined) detenuPayload.detachement = (body.detachement as string)?.trim() || null;
  if (body.etatCivil === "marie" || body.etatCivil === "celibataire" || body.etatCivil === "veuf") detenuPayload.etatCivil = body.etatCivil;
  if (body.etatCivil === null) detenuPayload.etatCivil = null;
  if (body.status === "prevenu" || body.status === "detenu" || body.status === "autre") detenuPayload.status = body.status;
  if (body.status === null) detenuPayload.status = null;

  if (Object.keys(dossierPayload).length > 0) {
    await db.update(dossiers).set(dossierPayload).where(eq(dossiers.id, id));
  }

  const [detenuRow] = await db.select({ id: detenus.id }).from(detenus).where(eq(detenus.dossierId, id)).limit(1);
  if (detenuRow && Object.keys(detenuPayload).length > 0) {
    await db.update(detenus).set(detenuPayload).where(eq(detenus.id, detenuRow.id));
  }

  return NextResponse.json({ ok: true });
}
