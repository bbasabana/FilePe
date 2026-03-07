/**
 * Ajoute colonnes photo/empreintes aux détenus et tables véhicules / plannings.
 * Exécuter : npx tsx scripts/migrate-photo-vehicules.ts
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

  await sql`ALTER TABLE detenus ADD COLUMN IF NOT EXISTS photo_url text`;
  await sql`ALTER TABLE detenus ADD COLUMN IF NOT EXISTS empreintes text`;

  await sql`
    CREATE TABLE IF NOT EXISTS vehicules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      immatriculation text NOT NULL,
      type text,
      created_at timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS plannings_vehicules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      vehicule_id uuid NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
      date_sortie date NOT NULL,
      heure text,
      trajet text,
      observation text,
      created_at timestamp with time zone DEFAULT now() NOT NULL
    )
  `;

  console.log("Migration photo / véhicules / plannings terminée.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
