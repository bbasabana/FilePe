"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Truck, Plus, Calendar, Pencil, Trash2, Check, X } from "lucide-react";

interface Vehicule {
  id: string;
  immatriculation: string;
  type: string | null;
}

interface Planning {
  id: string;
  vehiculeId: string;
  dateSortie: string;
  heure: string | null;
  trajet: string | null;
  observation: string | null;
  immatriculation: string | null;
  type: string | null;
}

export default function VehiculesPage() {
  const router = useRouter();
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [loadingV, setLoadingV] = useState(true);
  const [loadingP, setLoadingP] = useState(true);
  const [immat, setImmat] = useState("");
  const [typeVehicule, setTypeVehicule] = useState("");
  const [submittingV, setSubmittingV] = useState(false);
  const [vehiculeId, setVehiculeId] = useState("");
  const [dateSortie, setDateSortie] = useState("");
  const [heure, setHeure] = useState("");
  const [trajet, setTrajet] = useState("");
  const [observation, setObservation] = useState("");
  const [submittingP, setSubmittingP] = useState(false);

  useEffect(() => {
    fetch("/api/vehicules", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) router.replace("/login");
        return res.ok ? res.json() : [];
      })
      .then(setVehicules)
      .catch(() => setVehicules([]))
      .finally(() => setLoadingV(false));
  }, [router]);

  useEffect(() => {
    fetch("/api/plannings-vehicules", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then(setPlannings)
      .catch(() => setPlannings([]))
      .finally(() => setLoadingP(false));
  }, []);

  function addVehicule(e: React.FormEvent) {
    e.preventDefault();
    const v = immat.trim();
    if (!v) {
      toast.error("Immatriculation requise");
      return;
    }
    setSubmittingV(true);
    fetch("/api/vehicules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ immatriculation: v, type: typeVehicule.trim() || null }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setVehicules((prev) => [...prev, data].sort((a, b) => a.immatriculation.localeCompare(b.immatriculation)));
        setImmat("");
        setTypeVehicule("");
        toast.success("Véhicule ajouté");
      })
      .catch(() => toast.error("Erreur réseau"))
      .finally(() => setSubmittingV(false));
  }

  function addPlanning(e: React.FormEvent) {
    e.preventDefault();
    if (!vehiculeId.trim() || !dateSortie) {
      toast.error("Véhicule et date requis");
      return;
    }
    setSubmittingP(true);
    fetch("/api/plannings-vehicules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        vehiculeId: vehiculeId.trim(),
        dateSortie,
        heure: heure.trim() || null,
        trajet: trajet.trim() || null,
        observation: observation.trim() || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          return;
        }
        const v = vehicules.find((x) => x.id === data.vehiculeId);
        setPlannings((prev) => [{ ...data, immatriculation: v?.immatriculation ?? null, type: v?.type ?? null }, ...prev]);
        setVehiculeId("");
        setDateSortie("");
        setHeure("");
        setTrajet("");
        setObservation("");
        toast.success("Sortie planifiée");
      })
      .catch(() => toast.error("Erreur réseau"))
      .finally(() => setSubmittingP(false));
  }

  return (
    <div className="max-w-4xl w-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-white tracking-tight flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          Planification véhicules
        </h1>
        <p className="text-zinc-400 mt-1 text-[14px]">
          Gérer la flotte et planifier les sorties / transferts.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h2 className="text-[15px] font-semibold text-white mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Véhicules
          </h2>
          <form onSubmit={addVehicule} className="flex flex-wrap gap-3 mb-5">
            <input
              type="text"
              value={immat}
              onChange={(e) => setImmat(e.target.value)}
              placeholder="Immatriculation"
              className="flex-1 min-w-[140px] rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[14px] text-white placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              value={typeVehicule}
              onChange={(e) => setTypeVehicule(e.target.value)}
              placeholder="Type (fourgon, etc.)"
              className="w-36 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[14px] text-white placeholder:text-zinc-500 focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={submittingV}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </form>
          {loadingV ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : vehicules.length === 0 ? (
            <p className="text-[13px] text-zinc-500">Aucun véhicule. Ajoutez-en un ci-dessus.</p>
          ) : (
            <ul className="space-y-2">
              {vehicules.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[14px]"
                >
                  <span className="font-medium text-white font-mono">{v.immatriculation}</span>
                  {v.type && <span className="text-zinc-400 text-[13px]">{v.type}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h2 className="text-[15px] font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Sorties planifiées
          </h2>
          <form onSubmit={addPlanning} className="space-y-3 mb-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Véhicule</label>
                <select
                  value={vehiculeId}
                  onChange={(e) => setVehiculeId(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[14px] text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">— Choisir —</option>
                  {vehicules.map((v) => (
                    <option key={v.id} value={v.id}>{v.immatriculation}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Date</label>
                <input
                  type="date"
                  value={dateSortie}
                  onChange={(e) => setDateSortie(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[14px] text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Heure</label>
                <input
                  type="text"
                  value={heure}
                  onChange={(e) => setHeure(e.target.value)}
                  placeholder="Ex. 08h00"
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[14px] text-white placeholder:text-zinc-500 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Trajet</label>
                <input
                  type="text"
                  value={trajet}
                  onChange={(e) => setTrajet(e.target.value)}
                  placeholder="Ex. Makala → TGI"
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[14px] text-white placeholder:text-zinc-500 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Observation</label>
              <input
                type="text"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[14px] text-white placeholder:text-zinc-500 focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submittingP}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Planifier une sortie
            </button>
          </form>
          {loadingP ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : plannings.length === 0 ? (
            <p className="text-[13px] text-zinc-500">Aucune sortie planifiée.</p>
          ) : (
            <ul className="space-y-2">
              {plannings.map((p) => (
                <li
                  key={p.id}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-[13px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-medium text-white">{p.immatriculation ?? "—"}</span>
                    <span className="text-zinc-400">{p.dateSortie}</span>
                  </div>
                  {(p.heure || p.trajet) && (
                    <div className="mt-1 text-zinc-500">
                      {[p.heure, p.trajet].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {p.observation && <p className="mt-1 text-zinc-500 text-[12px]">{p.observation}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
