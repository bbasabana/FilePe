const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Longueur max du numéro de dossier (sécurité + stabilité). */
export const NUMERO_DOSSIER_MAX_LENGTH = 24;

/** Pattern : alphanumériques et tirets uniquement (un dossier = un détenu/prévenu, données isolées). */
const NUMERO_PATTERN = /^[A-Za-z0-9\-]+$/;

/** Génère un numéro de dossier unique type XYU45IU (6 caractères alphanumériques majuscules). */
export function generateNumeroDossier(): string {
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

/**
 * Normalise et valide le numéro de dossier (depuis l’URL).
 * Retourne le numéro en majuscules ou null si invalide.
 * Garantit l’isolation : chaque numéro ne donne accès qu’à un seul dossier (un seul détenu/prévenu).
 */
export function normalizeAndValidateNumero(raw: string | undefined): string | null {
  if (raw == null || typeof raw !== "string") return null;
  const decoded = decodeURIComponent(raw).trim();
  const numero = decoded.toUpperCase();
  if (numero.length === 0 || numero.length > NUMERO_DOSSIER_MAX_LENGTH) return null;
  if (!NUMERO_PATTERN.test(numero)) return null;
  return numero;
}
