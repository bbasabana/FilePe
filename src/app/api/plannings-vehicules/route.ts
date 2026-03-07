import { NextRequest, NextResponse } from "next/server";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, planningsVehicules, vehicules } from "@/db";
import { getSessionFromRequest } from "@/lib/auth-cookie";

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const vehiculeId = request.nextUrl.searchParams.get("vehiculeId");
  const db = getDb();
  const base = db
    .select({
      id: planningsVehicules.id,
      vehiculeId: planningsVehicules.vehiculeId,
      dateSortie: planningsVehicules.dateSortie,
      heure: planningsVehicules.heure,
      trajet: planningsVehicules.trajet,
      observation: planningsVehicules.observation,
      immatriculation: vehicules.immatriculation,
      type: vehicules.type,
    })
    .from(planningsVehicules)
    .leftJoin(vehicules, eq(planningsVehicules.vehiculeId, vehicules.id))
    .orderBy(desc(planningsVehicules.dateSortie), asc(planningsVehicules.heure));
  const list = vehiculeId
    ? await base.where(eq(planningsVehicules.vehiculeId, vehiculeId))
    : await base;
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  let body: { vehiculeId?: string; dateSortie?: string; heure?: string; trajet?: string; observation?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }
  const vehiculeId = body.vehiculeId?.trim();
  const dateSortie = body.dateSortie?.trim();
  if (!vehiculeId || !dateSortie) {
    return NextResponse.json({ error: "Véhicule et date de sortie requis" }, { status: 400 });
  }
  const db = getDb();
  const [row] = await db
    .insert(planningsVehicules)
    .values({
      vehiculeId,
      dateSortie,
      heure: body.heure?.trim() || null,
      trajet: body.trajet?.trim() || null,
      observation: body.observation?.trim() || null,
    })
    .returning();
  return NextResponse.json(row);
}
