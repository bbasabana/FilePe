/**
 * Ajoute la colonne blocked à la table users.
 * Exécuter : npx tsx scripts/migrate-users-blocked.ts
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL manquant");
    process.exit(1);
  }
  const sql = neon(url);

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false
  `;

  console.log("Colonne users.blocked ajoutée.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
