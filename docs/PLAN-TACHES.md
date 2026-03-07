# Plan de tâches — FilePe (Prison de Makala)

## Vue d’ensemble

Ce document décrit les tâches à réaliser pour faire évoluer FilePe vers une application professionnelle avec : distinction Prévenu / Détenu, photo webcam, empreintes simulées, export PDF, QR/scan, planification véhicules, et UX soignée (animations, notifications, chargements).

---

## 1. Identité visuelle et PDF

| # | Tâche | Détails |
|---|--------|--------|
| 1.1 | **Logo et en-tête PDF** | Intégrer le logo (drapeau du pays) + texte « Prison de la prévention » (ou nom officiel) en en-tête des documents et exports PDF. |
| 1.2 | **Génération PDF des dossiers** | Fonctionnalité pour télécharger un dossier (prévenu/détenu) en PDF : fiche complète avec logo, infos identité, dossier, prévention/observation, photo si présente. |
| 1.3 | **Template PDF réutilisable** | Créer un template PDF professionnel (en-tête, pied de page, mise en page) utilisé pour tous les exports. |

---

## 2. Photo (webcam) et révision

| # | Tâche | Détails |
|---|--------|--------|
| 2.1 | **Option photo après révision** | Lors de la création/révision d’un dossier, ajouter une étape ou une option « Prendre la photo ». |
| 2.2 | **Détection et capture webcam** | Détecter la webcam automatiquement (navigateur), afficher le flux vidéo, bouton « Prendre la photo » pour capturer une image. |
| 2.3 | **Enregistrement de la photo** | Enregistrer la photo (stockage : base ou stockage fichier), l’associer au dossier du prévenu/détenu et l’afficher sur la fiche et dans le PDF. |
| 2.4 | **Affichage photo sur la fiche** | Afficher la photo sur la fiche détail du dossier et dans les exports PDF. |

---

## 3. Prévenu vs Détenu (deux parcours distincts)

| # | Tâche | Détails |
|---|--------|--------|
| 3.1 | **Distinction claire dans le modèle** | S’assurer que le statut prévenu/détenu est bien pris en compte (déjà partiellement avec `status` détenu) et utilisé partout (liste, filtres, libellés). |
| 3.2 | **Menu latéral : Prévenus** | Ajouter un menu « Prévenus » dans la sidebar : liste et actions dédiées aux prévenus (création dossier prévenu, liste prévenus). |
| 3.3 | **Menu latéral : Détenus** | Conserver/adapter le menu « Détenus » pour les dossiers avec statut détenu uniquement. Navigation et listes séparées prévenus / détenus. |
| 3.4 | **Création selon le type** | À la création : choix « Prévenu » ou « Détenu » (ou menu séparé) pour que le dossier soit enregistré et affiché dans le bon menu (Prévenus vs Détenus). |

---

## 4. Empreintes (simulation)

| # | Tâche | Détails |
|---|--------|--------|
| 4.1 | **Étape après la photo** | Enchaîner : prise de photo → puis étape « Prise des empreintes » (simulation). |
| 4.2 | **Simulation gros doigts (pouces)** | Interface pour simuler la prise des empreintes des 2 pouces (gauche/droite) : zones cliquables ou glisser-déposer, indicateur « empreinte enregistrée ». |
| 4.3 | **Simulation quatre doigts (x2)** | Simuler la prise des 4 doigts main gauche et 4 doigts main droite (8 doigts), même principe que pouces. |
| 4.4 | **Stockage des empreintes** | En base ou en fichiers : stocker les images/refs des empreintes simulées liées au dossier (prévenu/détenu). |
| 4.5 | **Rappel dans la fiche** | Afficher dans la fiche du dossier un rappel que les empreintes ont été enregistrées (et option pour les revoir si besoin). |

---

## 5. QR code / Scan

| # | Tâche | Détails |
|---|--------|--------|
| 5.1 | **Génération d’un code (QR)** | Générer un QR code par dossier contenant au minimum : numéro du dossier + nom du prévenu/détenu (et éventuellement un lien court vers l’app). |
| 5.2 | **Page « détail minimal » (scan)** | Une page ou route dédiée accessible via le scan du QR : affichage minimal (numéro de dossier + nom), sans exposer toutes les infos. |
| 5.3 | **Intégration scan dans l’app** | Depuis l’application, possibilité de scanner un QR pour ouvrir directement ce détail minimal (ou la fiche complète si droits OK). |

---

## 6. Planification véhicules

| # | Tâche | Détails |
|---|--------|--------|
| 6.1 | **Modèle de données véhicules** | Tables ou champs : véhicules (immat, type, etc.), plannings (date, heure, trajet, véhicule, prévenus/détenus concernés si besoin). |
| 6.2 | **Menu « Planification véhicules »** | Nouveau menu dans la sidebar pour accéder à la planification. |
| 6.3 | **Écran de planification** | Calendrier ou liste des sorties/transferts : créer, modifier, supprimer des plannings, associer un véhicule. |
| 6.4 | **Lien prévenus/détenus (optionnel)** | Si besoin : associer des dossiers (prévenus/détenus) à un trajet pour suivi des transferts. |

---

## 7. UX : notifications, animations, chargements

| # | Tâche | Détails |
|---|--------|--------|
| 7.1 | **Notifications et toasts** | Renforcer les toasts (déjà en place) : succès / erreur / info de façon homogène sur toutes les actions (création, modification, suppression, export PDF). |
| 7.2 | **Pop-ups et confirmations** | Confirmations avant actions sensibles (suppression, déplacement de statut, etc.) ; modales claires et accessibles. |
| 7.3 | **États de chargement (skeleton / spinners)** | Éviter l’« impatience » : skeletons ou spinners sur les listes et fiches pendant le chargement. |
| 7.4 | **Animations et transitions** | Transitions fluides (pages, modales, listes), micro-animations sur boutons et cartes pour un rendu professionnel. |
| 7.5 | **Cohérence visuelle** | Design system (couleurs, espacements, typo) appliqué partout ; PDF et écrans alignés (logo, titres, libellés). |

---

## 8. Dossier « entraînement » (optionnel)

| # | Tâche | Détails |
|---|--------|--------|
| 8.1 | **Mode ou type « dossier d’entraînement »** | Possibilité de créer un dossier marqué « entraînement » (ou « démo ») pour former les utilisateurs sans polluer les vrais dossiers. |
| 8.2 | **Filtrage / liste** | Exclure par défaut les dossiers d’entraînement des listes opérationnelles, ou onglet/liste dédiée « Dossiers d’entraînement ». |

---

## Ordre de priorité suggéré

1. **Phase 1 — Fondations**  
   - 3.x Prévenu / Détenu (menus et parcours)  
   - 1.x Logo + PDF (template + export dossier)  
   - 7.x Notifications, chargements, animations de base  

2. **Phase 2 — Identification**  
   - 2.x Photo webcam (détection, capture, enregistrement, affichage)  
   - 4.x Empreintes (simulation pouces + doigts, stockage, rappel fiche)  

3. **Phase 3 — Traçabilité et planification**  
   - 5.x QR code + page détail minimal + scan  
   - 6.x Planification véhicules  

4. **Phase 4 — Finition**  
   - 8.x Dossiers d’entraînement (si retenu)  
   - 7.x Poursuite des animations et polish global  

---

## Résumé des livrables visés

- Logo (drapeau) + « Prison de la prévention » sur PDF et écrans.
- Export PDF professionnel des dossiers.
- Photo par webcam (détection auto, capture, enregistrement, affichage fiche + PDF).
- Deux parcours et menus distincts : **Prévenus** et **Détenus**.
- Simulation de prise d’empreintes (2 pouces + 8 doigts) après la photo, stockage et rappel en fiche.
- QR code par dossier (numéro + nom) et page détail minimal au scan.
- Planification des véhicules (modèle, écran, calendrier/liste).
- UX soignée : toasts, confirmations, skeletons, animations, rendu professionnel.
