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

  function FingerButton({ done, onClick, label, size = "sm" }: { done: boolean; onClick: () => void; label: string; size?: "sm" | "lg" }) {
    const dim = size === "lg" ? "h-12 w-12" : "h-10 w-10";
    const iconDim = size === "lg" ? "h-6 w-6" : "h-5 w-5";
    return (
      <button type="button" onClick={onClick} className="flex flex-col items-center gap-1">
        <div className={`${dim} rounded-full border-2 flex items-center justify-center transition ${done ? "bg-emerald-50 border-primary" : "border-slate-300 bg-slate-50"}`}>
          <Fingerprint className={`${iconDim} ${done ? "text-primary" : "text-slate-400"}`} />
        </div>
        <span className="text-[10px] text-slate-500">{label}</span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <h3 className="text-[13px] font-semibold text-slate-900 mb-1 flex items-center gap-2">
        <Fingerprint className="h-4 w-4 text-primary" />
        Empreintes (simulation)
      </h3>
      <p className="text-[11px] text-slate-500 mb-5">Cliquez sur chaque doigt pour simuler la prise d&apos;empreinte.</p>

      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">Pouces</p>
          <div className="flex gap-4">
            {POUCES.map((label, i) => (
              <FingerButton key={i} done={state.pouces[i]} onClick={() => toggle("pouces", i)} label={label} size="lg" />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">Main gauche (4 doigts)</p>
          <div className="flex gap-3">
            {state.doigtsGauche.map((done, i) => (
              <FingerButton key={i} done={done} onClick={() => toggle("doigtsGauche", i)} label={DOIGTS_GAUCHE[i]} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">Main droite (4 doigts)</p>
          <div className="flex gap-3">
            {state.doigtsDroite.map((done, i) => (
              <FingerButton key={i} done={done} onClick={() => toggle("doigtsDroite", i)} label={DOIGTS_DROITE[i]} />
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50 transition"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        Enregistrer les empreintes
      </button>
      {currentJson && (
        <p className="text-[10px] text-slate-500 mt-2">Empreintes enregistrées (simulation).</p>
      )}
    </div>
  );
}
