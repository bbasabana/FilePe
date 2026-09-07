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

## Empreintes (Live20R) — postes Windows

Sur chaque PC d’enrôlement (**2 étapes seulement**) :

1. Installer le **ZKFinger SDK** (driver Live20R)  
2. Dézipper le pack **FilePe-Fingerprint-Agent-Windows** → double-clic `Demarrer-Agent.bat`  
3. Chrome sur **ce PC** → https://file-pe.vercel.app/

Pas de Git, Node ni Python à installer pour les opérateurs.  
Détails : [`fingerprint-agent/INSTALL-WINDOWS.md`](fingerprint-agent/INSTALL-WINDOWS.md)

Le développement FilePe reste sur Mac → push → Vercel.
## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — lancer la prod
- `npm run db:push` — pousser le schéma Drizzle vers la base
- `npm run db:studio` — Drizzle Studio
