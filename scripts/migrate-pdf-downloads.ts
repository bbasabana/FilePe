/**
 * Crée la table pdf_downloads pour le suivi des téléchargements PDF.
 * Exécuter : npx tsx scripts/migrate-pdf-downloads.ts
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
    CREATE TABLE IF NOT EXISTS pdf_downloads (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      dossier_id uuid NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
      downloaded_at timestamp with time zone DEFAULT now() NOT NULL,
      downloaded_by text
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS pdf_downloads_dossier_id_idx ON pdf_downloads(dossier_id)`;
  await sql`CREATE INDEX IF NOT EXISTS pdf_downloads_downloaded_at_idx ON pdf_downloads(downloaded_at)`;

  console.log("Table pdf_downloads créée.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
