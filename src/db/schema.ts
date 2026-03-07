import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  pgEnum,
  index,
  boolean,
} from "drizzle-orm/pg-core";

// Rôles internes (non exposés dans l'UI)
export const userRoleEnum = pgEnum("user_role", ["admin", "juriste"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("juriste"),
  blocked: boolean("blocked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Juridictions / Parquets (référentiel)
export const juridictions = pgTable("juridictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  nom: text("nom").notNull(),
  code: text("code").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parquets = pgTable("parquets", {
  id: uuid("id").primaryKey().defaultRandom(),
  nom: text("nom").notNull(),
  code: text("code").unique(),
  juridictionId: uuid("juridiction_id").references(() => juridictions.id),
  circonscription: text("circonscription"), // Ville RDC (ex. Kinshasa, Lubumbashi)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Un dossier = un seul détenu ou prévenu. Photo, QR, pièces jointes et formations sont isolés par dossier.
// Dossier du détenu (fiche principale)
export const dossiers = pgTable(
  "dossiers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    numeroDossier: text("numero_dossier").notNull().unique(),
    dateEntree: date("date_entree").notNull(),
    juridictionId: uuid("juridiction_id").references(() => juridictions.id),
    parquetId: uuid("parquet_id").references(() => parquets.id),
    juridictionBasParquet: text("juridiction_bas_parquet"),
    prevention: text("prevention").notNull(), // motif de détention
    observation: text("observation"), // état de la procédure
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("dossiers_numero_dossier_idx").on(t.numeroDossier),
    index("dossiers_date_entree_idx").on(t.dateEntree),
  ]
);

// Catégorie : Civil, Policier, Militaire
export const categorieEnum = pgEnum("categorie", ["civil", "policier", "militaire"]);
export const etatCivilEnum = pgEnum("etat_civil", ["marie", "celibataire", "veuf"]);
export const statusDetenuEnum = pgEnum("status_detenu", ["prevenu", "detenu", "autre"]);

// Identité du détenu (liée au dossier)
export const detenus = pgTable("detenus", {
  id: uuid("id").primaryKey().defaultRandom(),
  dossierId: uuid("dossier_id")
    .notNull()
    .references(() => dossiers.id, { onDelete: "cascade" }),
  categorie: categorieEnum("categorie").notNull().default("civil"),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  poste: text("poste"), // profession / fonction
  lieuNaissance: text("lieu_naissance"),
  dateNaissance: date("date_naissance"),
  nationalite: text("nationalite"),
  adresse: text("adresse"),
  // Policier / Militaire
  matricule: text("matricule"),
  grade: text("grade"),
  fonction: text("fonction"),
  unite: text("unite"),
  detachement: text("detachement"),
  etatCivil: etatCivilEnum("etat_civil"),
  status: statusDetenuEnum("status"),
  photoUrl: text("photo_url"), // base64 ou URL après capture webcam
  empreintes: text("empreintes"), // JSON: { pouces: [], doigts: [] } simulés
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Véhicules (flotte)
export const vehicules = pgTable("vehicules", {
  id: uuid("id").primaryKey().defaultRandom(),
  immatriculation: text("immatriculation").notNull(),
  type: text("type"), // fourgon, voiture, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Planification des sorties/transferts
export const planningsVehicules = pgTable("plannings_vehicules", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehiculeId: uuid("vehicule_id").notNull().references(() => vehicules.id, { onDelete: "cascade" }),
  dateSortie: date("date_sortie").notNull(),
  heure: text("heure"),
  trajet: text("trajet"),
  observation: text("observation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Suivi des téléchargements PDF par dossier (nombre, date/heure, utilisateur)
export const pdfDownloads = pgTable(
  "pdf_downloads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dossierId: uuid("dossier_id").notNull().references(() => dossiers.id, { onDelete: "cascade" }),
    downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
    downloadedBy: text("downloaded_by"), // email de l'utilisateur connecté
  },
  (t) => [index("pdf_downloads_dossier_id_idx").on(t.dossierId), index("pdf_downloads_downloaded_at_idx").on(t.downloadedAt)]
);

// Pièces jointes (documents parquet / cour dressés pour le prévenu ou détenu)
export const pieceJointes = pgTable(
  "piece_jointes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dossierId: uuid("dossier_id").notNull().references(() => dossiers.id, { onDelete: "cascade" }),
    titre: text("titre").notNull(),
    fileName: text("file_name"),
    fileType: text("file_type"),
    fileBase64: text("file_base64"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("piece_jointes_dossier_id_idx").on(t.dossierId)]
);

// Formations suivies par le détenu (liées au dossier)
export const formations = pgTable("formations", {
  id: uuid("id").primaryKey().defaultRandom(),
  dossierId: uuid("dossier_id")
    .notNull()
    .references(() => dossiers.id, { onDelete: "cascade" }),
  intitule: text("intitule").notNull(),
  organisme: text("organisme"),
  dateDebut: date("date_debut"),
  dateFin: date("date_fin"),
  observation: text("observation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Dossier = typeof dossiers.$inferSelect;
export type NewDossier = typeof dossiers.$inferInsert;
export type Detenu = typeof detenus.$inferSelect;
export type NewDetenu = typeof detenus.$inferInsert;
export type Formation = typeof formations.$inferSelect;
export type NewFormation = typeof formations.$inferInsert;
export type Juridiction = typeof juridictions.$inferSelect;
export type Parquet = typeof parquets.$inferSelect;
export type Vehicule = typeof vehicules.$inferSelect;
export type PlanningVehicule = typeof planningsVehicules.$inferSelect;
export type PdfDownload = typeof pdfDownloads.$inferSelect;
export type NewPdfDownload = typeof pdfDownloads.$inferInsert;
export type PieceJointe = typeof pieceJointes.$inferSelect;
export type NewPieceJointe = typeof pieceJointes.$inferInsert;
