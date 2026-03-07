/** Villes de la RDC où existent des parquets (circonscriptions). */
export const CIRCONSCRIPTIONS_RDC = [
  "Kinshasa",
  "Lubumbashi",
  "Mbuji-Mayi",
  "Kananga",
  "Kisangani",
  "Bukavu",
  "Goma",
  "Matadi",
  "Kolwezi",
  "Likasi",
  "Kikwit",
  "Tshikapa",
  "Mbandaka",
  "Uvira",
  "Beni",
  "Butembo",
  "Kalemie",
  "Kamina",
  "Kabinda",
  "Kindu",
  "Boma",
  "Mweka",
  "Autre",
] as const;

export type CirconscriptionRDC = (typeof CIRCONSCRIPTIONS_RDC)[number];
