/**
 * Ajoute la colonne circonscription à la table parquets (si elle n'existe pas).
 * Exécuter avec: npx tsx scripts/add-circonscription.ts
 * Définir DATABASE_URL dans .env
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL manquant dans .env");
    process.exit(1);
  }
  const sql = neon(url);
  await sql`ALTER TABLE parquets ADD COLUMN IF NOT EXISTS circonscription text`;
  console.log("Colonne parquets.circonscription ajoutée (ou déjà présente).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
