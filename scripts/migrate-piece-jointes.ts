/**
 * Crée la table piece_jointes pour les documents joints (parquet, cour, etc.).
 * Exécuter : npx tsx scripts/migrate-piece-jointes.ts
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
    CREATE TABLE IF NOT EXISTS piece_jointes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      dossier_id uuid NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
      titre text NOT NULL,
      file_name text,
      file_type text,
      file_base64 text,
      created_at timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS piece_jointes_dossier_id_idx ON piece_jointes(dossier_id)`;

  console.log("Table piece_jointes créée.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
