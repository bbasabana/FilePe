"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Truck, Plus, Calendar } from "lucide-react";
import PageHero from "@/components/PageHero";

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

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#123a7a]/40 focus:ring-2 focus:ring-[#123a7a]/10";
const labelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400";

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
        setVehicules((prev) =>
          [...prev, data].sort((a, b) => a.immatriculation.localeCompare(b.immatriculation))
        );
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
        setPlannings((prev) => [
          { ...data, immatriculation: v?.immatriculation ?? null, type: v?.type ?? null },
          ...prev,
        ]);
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
    <div className="mx-auto w-full max-w-5xl animate-fade-in">
      <PageHero
        title="Planification véhicules"
        subtitle="Gérer la flotte et planifier les sorties / transferts."
        icon={Truck}
        accent="from-sky-400/20 to-transparent"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1f4a]/8 text-[#0b1f4a]">
              <Truck className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">Flotte</h2>
              <p className="text-[12px] text-slate-500">Véhicules enregistrés</p>
            </div>
          </div>

          <form onSubmit={addVehicule} className="mb-5 flex flex-wrap gap-2.5">
            <input
              type="text"
              value={immat}
              onChange={(e) => setImmat(e.target.value)}
              placeholder="Immatriculation"
              className={`${fieldClass} min-w-[140px] flex-1`}
            />
            <input
              type="text"
              value={typeVehicule}
              onChange={(e) => setTypeVehicule(e.target.value)}
              placeholder="Type (fourgon…)"
              className={`${fieldClass} w-36`}
            />
            <button
              type="submit"
              disabled={submittingV}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition hover:bg-amber-300 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </form>

          {loadingV ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : vehicules.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-[13px] text-slate-500">
              Aucun véhicule. Ajoutez-en un ci-dessus.
            </p>
          ) : (
            <ul className="space-y-2">
              {vehicules.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3"
                >
                  <span className="font-mono text-[14px] font-semibold text-slate-900">
                    {v.immatriculation}
                  </span>
                  {v.type ? (
                    <span className="rounded-md bg-white px-2 py-0.5 text-[12px] text-slate-500 ring-1 ring-slate-200">
                      {v.type}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Calendar className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">Sorties</h2>
              <p className="text-[12px] text-slate-500">Planifier un transfert</p>
            </div>
          </div>

          <form onSubmit={addPlanning} className="mb-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Véhicule</label>
                <select
                  value={vehiculeId}
                  onChange={(e) => setVehiculeId(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">— Choisir —</option>
                  {vehicules.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.immatriculation}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  value={dateSortie}
                  onChange={(e) => setDateSortie(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Heure</label>
                <input
                  type="text"
                  value={heure}
                  onChange={(e) => setHeure(e.target.value)}
                  placeholder="Ex. 08h00"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Trajet</label>
                <input
                  type="text"
                  value={trajet}
                  onChange={(e) => setTrajet(e.target.value)}
                  placeholder="Makala → TGI"
                  className={fieldClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Observation</label>
              <input
                type="text"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className={fieldClass}
              />
            </div>
            <button
              type="submit"
              disabled={submittingP}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b1f4a] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#123a7a] disabled:opacity-50 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Planifier une sortie
            </button>
          </form>

          {loadingP ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : plannings.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-[13px] text-slate-500">
              Aucune sortie planifiée.
            </p>
          ) : (
            <ul className="space-y-2">
              {plannings.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[13px] font-semibold text-slate-900">
                      {p.immatriculation ?? "—"}
                    </span>
                    <span className="text-[12px] text-slate-500">{p.dateSortie}</span>
                  </div>
                  {(p.heure || p.trajet) && (
                    <p className="mt-1 text-[12px] text-slate-500">
                      {[p.heure, p.trajet].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {p.observation && (
                    <p className="mt-1 text-[12px] text-slate-400">{p.observation}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
