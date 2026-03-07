import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { getDb, parquets } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const db = getDb();
  const juridictionId = request.nextUrl.searchParams.get("juridictionId");
  const list = juridictionId
    ? await db
        .select()
        .from(parquets)
        .where(eq(parquets.juridictionId, juridictionId))
        .orderBy(asc(parquets.nom))
    : await db.select().from(parquets).orderBy(asc(parquets.nom));
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  let body: { nom?: string; code?: string; juridictionId?: string | null; circonscription?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }
  const nom = String(body.nom ?? "").trim();
  if (!nom) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }
  const db = getDb();
  try {
    const [row] = await db
      .insert(parquets)
      .values({
        nom,
        code: body.code?.trim() || null,
        juridictionId: body.juridictionId?.trim() || null,
        circonscription: body.circonscription?.trim() || null,
      })
      .returning();
    return NextResponse.json(row);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Ce code existe déjà" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
