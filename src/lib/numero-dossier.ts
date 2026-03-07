const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Génère un numéro de dossier unique type XYU45IU (6 caractères alphanumériques majuscules). */
export function generateNumeroDossier(): string {
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}
