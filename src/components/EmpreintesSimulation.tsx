"use client";

import { useState, useCallback, useEffect } from "react";
import { Fingerprint, Loader2 } from "lucide-react";

const POUCES = ["Pouce gauche", "Pouce droit"] as const;
const DOIGTS_GAUCHE = ["Index", "Majeur", "Annulaire", "Auriculaire"];
const DOIGTS_DROITE = ["Index", "Majeur", "Annulaire", "Auriculaire"];

export interface EmpreintesState {
  pouces: boolean[];
  doigtsGauche: boolean[];
  doigtsDroite: boolean[];
}

const defaultState: EmpreintesState = {
  pouces: [false, false],
  doigtsGauche: [false, false, false, false],
  doigtsDroite: [false, false, false, false],
};

function parseEmpreintes(json: string | null): EmpreintesState {
  if (!json) return defaultState;
  try {
    const o = JSON.parse(json) as Partial<EmpreintesState>;
    return {
      pouces: Array.isArray(o.pouces) ? o.pouces.slice(0, 2) : defaultState.pouces,
      doigtsGauche: Array.isArray(o.doigtsGauche) ? o.doigtsGauche.slice(0, 4) : defaultState.doigtsGauche,
      doigtsDroite: Array.isArray(o.doigtsDroite) ? o.doigtsDroite.slice(0, 4) : defaultState.doigtsDroite,
    };
  } catch {
    return defaultState;
  }
}

interface EmpreintesSimulationProps {
  currentJson: string | null;
  onSave: (json: string) => void;
  saving?: boolean;
}

export default function EmpreintesSimulation({ currentJson, onSave, saving }: EmpreintesSimulationProps) {
  const [state, setState] = useState<EmpreintesState>(() => parseEmpreintes(currentJson));
  useEffect(() => {
    setState(parseEmpreintes(currentJson));
  }, [currentJson]);

  const toggle = useCallback((group: keyof EmpreintesState, index: number) => {
    setState((prev) => {
      const arr = [...prev[group]];
      arr[index] = !arr[index];
      return { ...prev, [group]: arr };
    });
  }, []);

  function handleSave() {
    onSave(JSON.stringify(state));
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      <h3 className="text-[13px] font-semibold text-white mb-3 flex items-center gap-2">
        <Fingerprint className="h-4 w-4 text-primary" />
        Empreintes (simulation)
      </h3>
      <p className="text-[11px] text-zinc-500 mb-4">Cliquez sur chaque doigt pour simuler la prise d&apos;empreinte.</p>

      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Pouces</p>
          <div className="flex gap-4">
            {POUCES.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggle("pouces", i)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`h-12 w-12 rounded-full border-2 flex items-center justify-center transition ${state.pouces[i] ? "bg-primary/30 border-primary" : "border-white/30 bg-white/[0.04]"}`}
                >
                  <Fingerprint className={`h-6 w-6 ${state.pouces[i] ? "text-primary" : "text-zinc-500"}`} />
                </div>
                <span className="text-[10px] text-zinc-500">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Main gauche (4 doigts)</p>
          <div className="flex gap-3">
            {state.doigtsGauche.map((done, i) => (
              <button key={i} type="button" onClick={() => toggle("doigtsGauche", i)} className="flex flex-col items-center gap-1">
                <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition ${done ? "bg-primary/30 border-primary" : "border-white/30 bg-white/[0.04]"}`}>
                  <Fingerprint className={`h-5 w-5 ${done ? "text-primary" : "text-zinc-500"}`} />
                </div>
                <span className="text-[10px] text-zinc-500">{DOIGTS_GAUCHE[i]}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Main droite (4 doigts)</p>
          <div className="flex gap-3">
            {state.doigtsDroite.map((done, i) => (
              <button key={i} type="button" onClick={() => toggle("doigtsDroite", i)} className="flex flex-col items-center gap-1">
                <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition ${done ? "bg-primary/30 border-primary" : "border-white/30 bg-white/[0.04]"}`}>
                  <Fingerprint className={`h-5 w-5 ${done ? "text-primary" : "text-zinc-500"}`} />
                </div>
                <span className="text-[10px] text-zinc-500">{DOIGTS_DROITE[i]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dim disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        Enregistrer les empreintes
      </button>
      {currentJson && (
        <p className="text-[10px] text-zinc-500 mt-2">Empreintes enregistrées (simulation).</p>
      )}
    </div>
  );
}
