# Sécurité et isolation des données — FilePe

## Principe : un dossier = un détenu ou prévenu

Chaque **dossier** correspond à **une seule personne** (détenu ou prévenu). Les données suivantes sont **strictement isolées** par dossier :

- **Photo** : stockée sur le détenu lié au dossier (`detenus.photo_url`), un dossier ayant au plus un détenu.
- **QR code** : généré à partir du numéro de dossier (unique). Le scan ne renvoie que le numéro + nom/prénom, pas d’autres données.
- **Pièces jointes** : table `piece_jointes` avec `dossier_id`. Toute lecture/suppression est filtrée par numéro de dossier (résolu côté serveur).
- **Formations** : table `formations` avec `dossier_id`, accédées uniquement via le numéro de dossier.
- **Téléchargements PDF** : table `pdf_downloads` avec `dossier_id`, utilisée pour l’audit par dossier.

Aucune de ces données n’est partagée entre dossiers.

## Accès par numéro de dossier (pas d’ID exposé)

- Les URLs et APIs utilisent le **numéro de dossier** (ex. `8YV6GL`), jamais l’UUID interne en base.
- Le numéro est **validé** (`normalizeAndValidateNumero`) : format alphanumérique + tirets, longueur limitée.
- Les IDs internes (dossier, détenu, pièce jointe, etc.) ne sont **pas renvoyés** dans les réponses client pour les dossiers (liste et détail).
- Pour les pièces jointes, l’ID est utilisé uniquement dans des routes protégées et toujours **vérifié** avec le `dossier_id` résolu à partir du numéro.

## Authentification et cookies

- Authentification par **cookies HTTP-only** (pas de token dans le `localStorage`).
- Les routes API dossier, pièces jointes, formations, PDF, etc. exigent une **session valide** (`getSessionFromRequest`).
- L’API publique `/api/public/dossier/[numero]` (scan QR) ne renvoie que numéro + nom + prénom, sans données sensibles.

## Bonnes pratiques appliquées

- **Recherche** : paramètre `q` limité en longueur et caractères `%` / `_` échappés pour les requêtes `LIKE`.
- **Pièces jointes** : taille max du fichier (base64) ~4 Mo ; ID pièce jointe validé en format UUID.
- **Suppression en cascade** : suppression d’un dossier supprime détenu, formations, pièces jointes et enregistrements de téléchargement PDF associés.
