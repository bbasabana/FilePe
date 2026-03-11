"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ScanDossierPage() {
  const params = useParams();
  const numero = (params.numero as string)?.trim();
  const [data, setData] = useState<{ numeroDossier: string; nom: string; prenom: string } | null>(null);
  const [loading, setLoading] = useState(!!numero);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!numero) {
      setLoading(false);
      return;
    }
    fetch(`/api/public/dossier/${encodeURIComponent(numero)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [numero]);

  if (!numero) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-slate-500 text-sm">Numéro de dossier manquant.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 text-sm">Dossier introuvable.</p>
          <p className="text-slate-400 text-xs mt-1">N° {numero}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Dossier</p>
        <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{data.numeroDossier}</p>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Nom</p>
          <p className="text-lg font-semibold text-slate-900">{data.nom} {data.prenom}</p>
        </div>
        <p className="text-[10px] text-slate-500 mt-6">Prison de la prévention — FilePe</p>
      </div>
    </div>
  );
}
