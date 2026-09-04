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

L’app web (Vercel) ne parle pas directement au USB. Sur chaque poste d’enrôlement :

1. Brancher le **ZKTeco Live20R**
2. Lancer l’agent local : voir [`fingerprint-agent/README.md`](fingerprint-agent/README.md)
3. Ouvrir la fiche prévenu/détenu → **Empreintes digitales** (5 doigts × 3 prises)

```bash
cd fingerprint-agent && npm install && npm run start:mock   # test sans lecteur
# ou FILEPE_FP_MODE=hardware npm start                     # Live20R réel (Windows)
```

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — lancer la prod
- `npm run db:push` — pousser le schéma Drizzle vers la base
- `npm run db:studio` — Drizzle Studio
