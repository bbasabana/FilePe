# FilePe — Présentation aux partenaires  
*Gestion numérique des dossiers détenus et prévenus — Prison centrale de Makala*

---

## 1. De quoi s’agit-il ?

**FilePe** est une application web de **gestion des dossiers** des personnes détenues et des prévenus, déployée au profit de la **Prison centrale de Makala** (Kinshasa, RDC). Elle permet d’enregistrer, d’organiser et de suivre l’ensemble des informations liées à chaque dossier : identité, juridiction ou parquet, prévention, observation, formations, pièces jointes (documents parquet/cour), photo et empreintes simulées.

Le système distingue clairement **prévenus** et **détenus**, gère les **référentiels** (juridictions, parquets, circonscriptions), la **planification des véhicules** pour les transferts, et la **génération de fiches PDF** conformes (drapeau RDC, logo, QR code) pour un usage institutionnel.

---

## 2. Pourquoi ce projet est-il important ?

- **Traçabilité** : Chaque dossier est identifié par un numéro unique (ex. 8YV6GL). Les téléchargements de fiches PDF sont enregistrés (date, heure, utilisateur), ce qui renforce l’audit et la responsabilité.
- **Unité de l’information** : Un dossier = une personne. Photo, QR code, pièces jointes et formations sont strictement rattachés à ce dossier, sans mélange ni exposition d’identifiants internes.
- **Efficacité opérationnelle** : Recherche par nom, prénom ou numéro de dossier ; listes filtrées (prévenus / détenus / tous) ; accès rapide à la fiche complète et à la fiche PDF.
- **Sécurité des données** : Authentification par session (cookies sécurisés), pas de jetons en clair côté navigateur ; accès réservé aux utilisateurs autorisés (rôles Juriste / Admin) ; aucun identifiant technique de base de données exposé dans les liens ou les interfaces.
- **Transparence** : Historique des téléchargements PDF par dossier ; gestion des utilisateurs (création, blocage, rôles) pour les administrateurs ; conservation des documents joints (parquet, cour) et de leur mention sur la fiche PDF.

Ce projet répond donc directement aux enjeux de **modernisation**, de **contrôle** et de **confiance** dans la gestion des dossiers en milieu carcéral.

---

## 3. Ce que le projet requiert

### 3.1 Côté technique

- **Hébergement** : Serveur ou plateforme capable d’exécuter une application Next.js (Node.js) et d’héberger une base de données PostgreSQL (le projet utilise aujourd’hui une base type Neon, compatible cloud).
- **Connexion** : Accès internet stable pour les postes utilisateurs (bureau, tablettes) et pour le serveur.
- **Navigateur** : Utilisation sur navigateur récent (Chrome, Firefox, Safari, Edge), y compris sur tablette et mobile pour la consultation et la saisie sur le terrain.

### 3.2 Côté organisationnel

- **Utilisateurs** : Comptes distincts pour les agents (juristes, administration) avec des rôles définis ; un administrateur pour la gestion des comptes et des référentiels.
- **Procédures** : Définition de qui crée/modifie les dossiers, qui peut télécharger les PDF, et comment sont utilisés les documents joints (parquet, cour).
- **Formation** : Prise en main de l’interface (création de dossier, recherche, édition, pièces jointes, génération PDF) pour garantir un usage correct et homogène.

### 3.3 Côté financier

- **Infrastructure** : Coûts d’hébergement (serveur et base de données), nom de domaine, éventuel certificat SSL. Ordre de grandeur modéré pour une solution cloud (abonnement mensuel ou annuel selon le fournisseur).
- **Maintenance** : Mise à jour technique (sécurité, dépendances), sauvegardes, support en cas d’incident. Une enveloppe dédiée « maintenance et évolution » permet de pérenniser le outil.
- **Évolution** : Possibilité de budgétiser des évolutions (nouveaux champs, rapports, déploiement vers d’autres établissements) en fonction des besoins validés par la tutelle et les partenaires.

Une **estimation détaillée** (hébergement, maintenance, formation) peut être établie en fonction du mode de déploiement retenu (cloud public, hébergement dédié, etc.).

---

## 4. Transparence et gouvernance

- **Traçabilité des actions** : Chaque téléchargement de fiche PDF est enregistré (qui, quand). Les partenaires et la tutelle peuvent exiger un rapport ou un export de ces données pour contrôler l’usage.
- **Rôles et responsabilités** : Les comptes « Admin » gèrent les utilisateurs et les paramètres ; les comptes « Juriste » utilisent les dossiers au quotidien. Aucun rôle n’est exposé de façon inutile dans l’interface publique.
- **Documents officiels** : Les pièces jointes (documents parquet/cour) sont stockées avec un titre et une date ; elles sont listées sur la fiche PDF, ce qui renforce la traçabilité et la conformité du dossier.
- **Pérennité** : Le projet peut être livré avec une documentation technique et une note sur la sécurité des données (isolation des dossiers, absence d’exposition d’identifiants), afin que les partenaires et les autorités puissent en évaluer la solidité.

---

## 5. Données : protection et bonnes pratiques

- **Isolation** : Un dossier = une personne. Les données (identité, photo, pièces jointes, formations, historique PDF) ne sont jamais mélangées entre dossiers.
- **Identification publique** : Seul un **numéro de dossier** (ex. 8YV6GL) est utilisé dans les liens et les APIs. Les identifiants techniques de la base de données ne sont jamais exposés, ce qui limite les risques d’intrusion ou de manipulation.
- **Authentification** : Connexion par mot de passe (hash sécurisé) ; session gérée par cookies dédiés, sans stockage de token en clair dans le navigateur.
- **Scan QR** : Le QR code sur la fiche permet d’afficher, sur une page dédiée, uniquement le numéro de dossier et le nom/prénom — aucune donnée sensible supplémentaire n’est exposée sans authentification.
- **Données sensibles** : Les accès aux listes, fiches détaillées, pièces jointes et PDF sont réservés aux utilisateurs connectés et autorisés.

Le projet est conçu pour **réduire les risques** liés à la divulgation ou au détournement des données tout en facilitant le travail des agents et le contrôle par la hiérarchie et les partenaires.

---

## 6. Synthèse à l’attention des partenaires et décideurs

FilePe est un **outil de gestion numérique des dossiers** au service de la Prison centrale de Makala. Il améliore la traçabilité, la sécurité et la transparence tout en clarifiant les besoins en hébergement, formation et budget.  

Sa valeur tient à la **rigueur des données** (un dossier = une personne, pas d’exposition d’identifiants), à la **traçabilité des téléchargements PDF** et à la **gestion des pièces jointes** et des rôles utilisateur.  

Une présentation orale ou une démonstration peut compléter ce document pour montrer concrètement l’application aux autorités de tutelle et aux partenaires techniques et financiers.

---

*Document préparé pour la présentation du projet FilePe aux partenaires et aux autorités compétentes. Version du 6 mars 2026.*
