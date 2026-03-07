import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb, juridictions } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";

export async function GET(_request: NextRequest) {
  const session = getSessionFromRequest(_request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const db = getDb();
  const list = await db.select().from(juridictions).orderBy(asc(juridictions.nom));
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  let body: { nom?: string; code?: string };
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
      .insert(juridictions)
      .values({
        nom,
        code: body.code?.trim() || null,
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
