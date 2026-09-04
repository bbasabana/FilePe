/** Modèle d’empreintes Live20R — 5 doigts × 3 prises */

export const FINGER_IDS = ["pouce", "index", "majeur", "annulaire", "auriculaire"] as const;
export type FingerId = (typeof FINGER_IDS)[number];

export const FINGER_LABELS: Record<FingerId, string> = {
  pouce: "Pouce",
  index: "Index",
  majeur: "Majeur",
  annulaire: "Annulaire",
  auriculaire: "Auriculaire",
};

export type HandId = "gauche" | "droite";
export const SAMPLES_PER_FINGER = 3;
export const EMPREINTES_VERSION = 2 as const;

export interface FingerSample {
  imageBase64: string;
  templateBase64: string;
  capturedAt: string;
}

export interface FingerEnrollment {
  fingerId: FingerId;
  hand: HandId;
  samples: FingerSample[];
  templateMergedBase64?: string | null;
  completed: boolean;
}

export interface EmpreintesData {
  version: typeof EMPREINTES_VERSION;
  hand: HandId;
  device?: string | null;
  mode?: "hardware" | "mock" | "demo" | null;
  enrolledAt?: string | null;
  fingers: FingerEnrollment[];
}

export function emptyEmpreintes(hand: HandId = "droite"): EmpreintesData {
  return {
    version: EMPREINTES_VERSION,
    hand,
    device: null,
    mode: null,
    enrolledAt: null,
    fingers: FINGER_IDS.map((fingerId) => ({
      fingerId,
      hand,
      samples: [],
      templateMergedBase64: null,
      completed: false,
    })),
  };
}

export function parseEmpreintes(json: string | null): EmpreintesData | null {
  if (!json) return null;
  try {
    const o = JSON.parse(json) as Partial<EmpreintesData> & {
      pouces?: boolean[];
      doigtsGauche?: boolean[];
      doigtsDroite?: boolean[];
    };
    if (o.version === 2 && Array.isArray(o.fingers)) {
      const hand = o.hand === "gauche" ? "gauche" : "droite";
      const byId = new Map(o.fingers.map((f) => [f.fingerId, f]));
      return {
        version: EMPREINTES_VERSION,
        hand,
        device: o.device ?? null,
        mode: o.mode ?? null,
        enrolledAt: o.enrolledAt ?? null,
        fingers: FINGER_IDS.map((fingerId) => {
          const f = byId.get(fingerId);
          const samples = Array.isArray(f?.samples) ? f!.samples.slice(0, SAMPLES_PER_FINGER) : [];
          return {
            fingerId,
            hand: f?.hand ?? hand,
            samples,
            templateMergedBase64: f?.templateMergedBase64 ?? null,
            completed: Boolean(f?.completed) || samples.length >= SAMPLES_PER_FINGER,
          };
        }),
      };
    }
    // Ancienne simulation (booléens) — pas de templates
    return null;
  } catch {
    return null;
  }
}

export function allFingersComplete(data: EmpreintesData): boolean {
  return data.fingers.every((f) => f.completed && f.samples.length >= SAMPLES_PER_FINGER);
}

export function completedCount(data: EmpreintesData): number {
  return data.fingers.filter((f) => f.completed).length;
}
