# FilePe

Application de gestion des dossiers des détenus — Prison de Makala, Kinshasa.

## Stack

- **Next.js 15** (App Router)
- **Drizzle ORM** + **PostgreSQL** (Neon)
- **Zustand** (état client)
- **Tailwind CSS**

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigner DATABASE_URL
npm run db:push        # créer les tables (connexion Neon requise)
SEED_EMAIL=admin@makala.cd SEED_PASSWORD=admin123 SEED_ROLE=admin npm run seed
npm run dev
```

## Empreintes (Live20R)

Sur chaque **PC Windows** d’enrôlement (pas sur Vercel) :

1. Installer le **ZKFinger SDK** (driver)
2. Lancer l’agent (`fingerprint-agent` → `Demarrer-Agent.bat` ou l’exe)
3. Ouvrir https://file-pe.vercel.app/ dans Chrome sur **ce même PC**

Détails : [`fingerprint-agent/INSTALL-WINDOWS.md`](fingerprint-agent/INSTALL-WINDOWS.md)

Le développement FilePe reste sur Mac → push → Vercel.
## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — lancer la prod
- `npm run db:push` — pousser le schéma Drizzle vers la base
- `npm run db:studio` — Drizzle Studio
