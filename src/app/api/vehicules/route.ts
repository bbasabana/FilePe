import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb, vehicules } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const db = getDb();
  const list = await db.select().from(vehicules).orderBy(asc(vehicules.immatriculation));
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  let body: { immatriculation?: string; type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }
  const immatriculation = String(body.immatriculation ?? "").trim();
  if (!immatriculation) {
    return NextResponse.json({ error: "Immatriculation requise" }, { status: 400 });
  }
  const db = getDb();
  const [row] = await db
    .insert(vehicules)
    .values({
      immatriculation,
      type: body.type?.trim() || null,
    })
    .returning();
  return NextResponse.json(row);
}
