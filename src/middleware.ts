import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protection dashboard gérée côté client (Zustand persist en localStorage).
// Vous pouvez ajouter plus tard un cookie de session pour une protection serveur.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
