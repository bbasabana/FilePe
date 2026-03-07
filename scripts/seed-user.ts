/**
 * Script pour créer un utilisateur initial (admin ou juriste).
 * Exécuter avec: npx tsx scripts/seed-user.ts
 * Définir DATABASE_URL et optionnellement HASH_ROUNDS.
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as bcrypt from "bcryptjs";
import { users } from "../src/db/schema";

const email = process.env.SEED_EMAIL ?? "admin@makala.cd";
const password = process.env.SEED_PASSWORD ?? "admin123";
const role = (process.env.SEED_ROLE as "admin" | "juriste") ?? "admin";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  const hash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    email,
    passwordHash: hash,
    role,
  });
  console.log("Utilisateur créé:", email, "rôle:", role);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
