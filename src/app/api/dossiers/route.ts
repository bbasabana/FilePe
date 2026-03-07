import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { getDb, dossiers, detenus } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";
import { generateNumeroDossier } from "@/lib/numero-dossier";

/** Champs retournés en liste : pas d’id interne (accès uniquement par numéro de dossier). */
const listSelectFields = {
  numeroDossier: dossiers.numeroDossier,
  dateEntree: dossiers.dateEntree,
  prevention: dossiers.prevention,
  observation: dossiers.observation,
  juridictionId: dossiers.juridictionId,
  parquetId: dossiers.parquetId,
  juridictionBasParquet: dossiers.juridictionBasParquet,
  nom: detenus.nom,
  prenom: detenus.prenom,
  status: detenus.status,
};

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const db = getDb();
  const qRaw = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const q = qRaw.length > 100 ? qRaw.slice(0, 100) : qRaw;
  const qLike = q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
  const statusFilter = request.nextUrl.searchParams.get("status")?.trim(); // "prevenu" | "detenu"
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(10, Number(request.nextUrl.searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const searchCond = q
    ? or(
        like(dossiers.numeroDossier, `%${qLike}%`),
        like(detenus.nom, `%${qLike}%`),
        like(detenus.prenom, `%${qLike}%`)
      )
    : undefined;
  const statusCond =
    statusFilter === "prevenu" || statusFilter === "detenu"
      ? eq(detenus.status, statusFilter)
      : undefined;
  const whereCond =
    searchCond && statusCond
      ? and(searchCond, statusCond)
      : searchCond ?? statusCond ?? undefined;

  const list = await db
    .select(listSelectFields)
    .from(dossiers)
    .leftJoin(detenus, eq(dossiers.id, detenus.dossierId))
    .where(whereCond)
    .orderBy(desc(dossiers.dateEntree))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(dossiers)
    .leftJoin(detenus, eq(dossiers.id, detenus.dossierId))
    .where(whereCond);

  return NextResponse.json({ list, total: count });
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const db = getDb();
  let body: {
    numeroDossier?: string;
    dateEntree?: string;
    juridictionId?: string | null;
    parquetId?: string | null;
    juridictionBasParquet?: string | null;
    prevention?: string;
    observation?: string | null;
    nom?: string;
    prenom?: string;
    poste?: string | null;
    lieuNaissance?: string | null;
    dateNaissance?: string | null;
    nationalite?: string | null;
    adresse?: string | null;
    categorie?: "civil" | "policier" | "militaire";
    matricule?: string | null;
    grade?: string | null;
    fonction?: string | null;
    unite?: string | null;
    detachement?: string | null;
    etatCivil?: "marie" | "celibataire" | "veuf" | null;
    status?: "prevenu" | "detenu" | "autre" | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const dateEntree = body.dateEntree;
  const prevention = String(body.prevention ?? "").trim();
  const nom = String(body.nom ?? "").trim();
  const prenom = String(body.prenom ?? "").trim();
  const categorie = body.categorie === "policier" || body.categorie === "militaire" ? body.categorie : "civil";

  if (!dateEntree || !prevention || !nom || !prenom) {
    return NextResponse.json(
      { error: "Date d'entrée, prévention, nom et prénom requis" },
      { status: 400 }
    );
  }

  let numeroDossier = String(body.numeroDossier ?? "").trim();
  const useAutoNumero = !numeroDossier;
  const maxRetries = 5;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (useAutoNumero) {
      numeroDossier = generateNumeroDossier();
    }
    try {
      const [dossier] = await db
        .insert(dossiers)
        .values({
          numeroDossier,
          dateEntree,
          juridictionId: body.juridictionId || null,
          parquetId: body.parquetId || null,
          juridictionBasParquet: body.juridictionBasParquet?.trim() || null,
          prevention,
          observation: body.observation?.trim() || null,
        })
        .returning({ id: dossiers.id });

      if (!dossier) {
        return NextResponse.json({ error: "Erreur création dossier" }, { status: 500 });
      }

      await db.insert(detenus).values({
        dossierId: dossier.id,
        categorie,
        nom,
        prenom,
        poste: body.poste?.trim() || null,
        lieuNaissance: body.lieuNaissance?.trim() || null,
        dateNaissance: body.dateNaissance || null,
        nationalite: body.nationalite?.trim() || null,
        adresse: body.adresse?.trim() || null,
        matricule: body.matricule?.trim() || null,
        grade: body.grade?.trim() || null,
        fonction: body.fonction?.trim() || null,
        unite: body.unite?.trim() || null,
        detachement: body.detachement?.trim() || null,
        etatCivil: body.etatCivil || null,
        status: body.status || null,
      });

      return NextResponse.json({ numeroDossier });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("unique") || msg.includes("duplicate")) {
        if (!useAutoNumero) {
          return NextResponse.json(
            { error: "Ce numéro de dossier existe déjà" },
            { status: 409 }
          );
        }
        continue;
      }
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "Impossible de générer un numéro unique. Réessayez." },
    { status: 500 }
  );
}
