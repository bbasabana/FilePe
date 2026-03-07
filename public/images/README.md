# Logo et images

Déposez ici vos assets statiques pour l’application FilePe.

## Structure recommandée

- **`logo.png`** (ou `.svg`) — Logo principal (ex. drapeau, emblème) pour l’en-tête et les PDF.
- **`favicon.ico`** — Icône de l’onglet du navigateur (optionnel, peut rester à la racine de `public/`).
- Autres images (illustrations, fonds, etc.) selon vos besoins.

## Utilisation dans l’app

Les fichiers dans `public/images/` sont servis à l’URL `/images/nom-du-fichier`.

Exemples :
- `public/images/logo.png` → `/images/logo.png`
- Dans un composant : `<img src="/images/logo.png" alt="Logo" />`
- Avec Next.js Image : `import Image from "next/image"` puis `<Image src="/images/logo.png" width={120} height={40} alt="Logo" />`
