"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, User, Shield, Badge } from "lucide-react";
import { generateNumeroDossier } from "@/lib/numero-dossier";

interface Juridiction {
  id: string;
  nom: string;
  code: string | null;
}
interface Parquet {
  id: string;
  nom: string;
  code: string | null;
  juridictionId: string | null;
}

type Categorie = "civil" | "policier" | "militaire";

const STEPS = [
  { id: 1, title: "Catégorie" },
  { id: 2, title: "Identité" },
  { id: 3, title: "Informations policier / militaire" },
  { id: 4, title: "Dossier" },
  { id: 5, title: "Prévention et observation" },
] as const;

const CATEGORIES: { value: Categorie; label: string; icon: typeof User }[] = [
  { value: "civil", label: "Civil", icon: User },
  { value: "policier", label: "Policier", icon: Shield },
  { value: "militaire", label: "Militaire", icon: Badge },
];

const ETAT_CIVIL_OPTIONS = [
  { value: "marie", label: "Marié(e)" },
  { value: "celibataire", label: "Célibataire" },
  { value: "veuf", label: "Veuve / Veuf" },
] as const;

const STATUS_OPTIONS = [
  { value: "prevenu", label: "Prévenu" },
  { value: "detenu", label: "Détenu" },
  { value: "autre", label: "Autre" },
] as const;

export default function NouveauDossierPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get("type"); // "prevenu" | "detenu" => préremplit le statut
  const [step, setStep] = useState(1);
  const [juridictions, setJuridictions] = useState<Juridiction[]>([]);
  const [parquets, setParquets] = useState<Parquet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [categorie, setCategorie] = useState<Categorie>("civil");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [poste, setPoste] = useState("");
  const [lieuNaissance, setLieuNaissance] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [nationalite, setNationalite] = useState("");
  const [adresse, setAdresse] = useState("");
  const [matricule, setMatricule] = useState("");
  const [grade, setGrade] = useState("");
  const [fonction, setFonction] = useState("");
  const [unite, setUnite] = useState("");
  const [detachement, setDetachement] = useState("");
  const [etatCivil, setEtatCivil] = useState<"marie" | "celibataire" | "veuf" | "">("");
  const [status, setStatus] = useState<"prevenu" | "detenu" | "autre" | "">(
    typeFromUrl === "prevenu" ? "prevenu" : typeFromUrl === "detenu" ? "detenu" : ""
  );

  const [generatedNumeroDossier, setGeneratedNumeroDossier] = useState("");
  const [dateEntree, setDateEntree] = useState("");
  const [juridictionId, setJuridictionId] = useState<string>("");
  const [parquetId, setParquetId] = useState<string>("");
  const [juridictionBasParquet, setJuridictionBasParquet] = useState("");
  const [prevention, setPrevention] = useState("");
  const [observation, setObservation] = useState("");

  useEffect(() => {
    fetch("/api/juridictions", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setJuridictions)
      .catch(() => setJuridictions([]));
    fetch("/api/parquets", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setParquets)
      .catch(() => setParquets([]));
  }, []);

  // Un seul choix : Juridiction près OU Parquet (mutuellement exclusifs)
  const juridictionChosen = !!juridictionId;
  const parquetChosen = !!parquetId;

  const isPolicierOuMilitaire = categorie === "policier" || categorie === "militaire";

  const canGoStep2 = true; // Catégorie a une valeur par défaut
  const canGoStep3 = nom.trim() && prenom.trim();
  const canGoStep4 = dateEntree.trim();
  const canSubmit = prevention.trim();

  /** Étapes affichées dans l’indicateur : 4 si civil (sans étape Infos), 5 si policier/militaire */
  const displaySteps = isPolicierOuMilitaire ? STEPS : [STEPS[0], STEPS[1], STEPS[3], STEPS[4]];
  const currentStepDisplay = isPolicierOuMilitaire ? step : (step <= 2 ? step : step - 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 5) {
      if (step === 2 && !isPolicierOuMilitaire) {
        setGeneratedNumeroDossier(generateNumeroDossier());
        setStep(4); // Civil : sauter l’étape Informations
      } else if (step === 3) {
        setGeneratedNumeroDossier(generateNumeroDossier());
        setStep(4);
      } else {
        setStep(step + 1);
      }
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/dossiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          numeroDossier: generatedNumeroDossier || undefined,
          dateEntree: dateEntree || null,
          juridictionId: juridictionId || null,
          parquetId: parquetId || null,
          juridictionBasParquet: juridictionBasParquet.trim() || null,
          prevention: prevention.trim(),
          observation: observation.trim() || null,
          nom: nom.trim(),
          prenom: prenom.trim(),
          poste: poste.trim() || null,
          lieuNaissance: lieuNaissance.trim() || null,
          dateNaissance: dateNaissance || null,
          nationalite: nationalite.trim() || null,
          adresse: adresse.trim() || null,
          categorie,
          matricule: isPolicierOuMilitaire ? matricule.trim() || null : null,
          grade: isPolicierOuMilitaire ? grade.trim() || null : null,
          fonction: isPolicierOuMilitaire ? fonction.trim() || null : null,
          unite: isPolicierOuMilitaire ? unite.trim() || null : null,
          detachement: isPolicierOuMilitaire ? detachement.trim() || null : null,
          etatCivil: isPolicierOuMilitaire && etatCivil ? etatCivil : null,
          status: status || (typeFromUrl === "prevenu" ? "prevenu" : typeFromUrl === "detenu" ? "detenu" : null),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Erreur lors de la création";
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success("Dossier créé");
      if (data.numeroDossier) router.push(`/dashboard/dossiers/${encodeURIComponent(data.numeroDossier)}`);
      else router.push("/dashboard/dossiers");
    } catch {
      setError("Erreur de connexion");
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition";
  const labelClass = "block text-[12px] font-medium text-zinc-400 mb-2";

  return (
    <div className="max-w-2xl w-full animate-fade-in">
      {loading && (
        <div className="form-loader-overlay" aria-busy="true">
          <div className="form-loader-ring" aria-hidden />
          <span className="text-[14px] text-zinc-400">Création du dossier…</span>
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-[22px] font-semibold text-white tracking-tight">
          Nouveau dossier
        </h1>
        <p className="text-zinc-400 mt-1 text-[14px]">
          Créer un dossier détenu : catégorie, identité, dossier, prévention, observation.
        </p>
      </header>

      <div className="mt-6 flex items-center gap-2">
        {displaySteps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-medium transition-all duration-300 ${
                currentStepDisplay === i + 1
                  ? "bg-primary text-white scale-110"
                  : currentStepDisplay > i + 1
                    ? "bg-primary/20 text-primary"
                    : "bg-white/10 text-zinc-500"
              }`}
            >
              {i + 1}
            </div>
            {i < displaySteps.length - 1 && (
              <div className="h-px w-6 bg-white/10 shrink-0 transition-opacity" aria-hidden />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 text-[13px] mb-6">
            {error}
          </div>
        )}

        {/* Étape 1 : Catégorie */}
        {step === 1 && (
          <section className="step-enter rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-6">
            <h2 className="text-[15px] font-semibold text-white">{STEPS[0].title}</h2>
            <div>
              <label className={labelClass}>Choisir la catégorie</label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategorie(value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition-all duration-200 ${
                      categorie === value
                        ? "border-primary bg-primary/10 text-white"
                        : "border-white/[0.1] bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-[13px] font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Étape 2 : Identité */}
        {step === 2 && (
          <section className="step-enter rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-6">
            <h2 className="text-[15px] font-semibold text-white">{STEPS[1].title}</h2>
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Nom *</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Nom de famille"
                  />
                </div>
                <div>
                  <label className={labelClass}>Prénom *</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Prénom"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Poste (profession)</label>
                <input
                  type="text"
                  value={poste}
                  onChange={(e) => setPoste(e.target.value)}
                  className={inputClass}
                  placeholder="Profession ou fonction"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Lieu de naissance</label>
                  <input
                    type="text"
                    value={lieuNaissance}
                    onChange={(e) => setLieuNaissance(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Date de naissance</label>
                  <input
                    type="date"
                    value={dateNaissance}
                    onChange={(e) => setDateNaissance(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Nationalité</label>
                <input
                  type="text"
                  value={nationalite}
                  onChange={(e) => setNationalite(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Adresse</label>
                <textarea
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </section>
        )}

        {/* Étape 3 : Informations policier / militaire (uniquement si catégorie policier ou militaire) */}
        {step === 3 && isPolicierOuMilitaire && (
          <section className="step-enter rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-6">
            <h2 className="text-[15px] font-semibold text-white">
              {categorie === "policier" ? "Informations policier" : "Informations militaire"}
            </h2>
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Matricule</label>
                  <input
                    type="text"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Grade</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Fonction</label>
                <input
                  type="text"
                  value={fonction}
                  onChange={(e) => setFonction(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Unité</label>
                  <input
                    type="text"
                    value={unite}
                    onChange={(e) => setUnite(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Détachement</label>
                  <input
                    type="text"
                    value={detachement}
                    onChange={(e) => setDetachement(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>État civil</label>
                  <select
                    value={etatCivil}
                    onChange={(e) => setEtatCivil(e.target.value as typeof etatCivil)}
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {ETAT_CIVIL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Statut</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Étape 4 : Dossier */}
        {step === 4 && (
          <section className="step-enter rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-6">
            <h2 className="text-[15px] font-semibold text-white">{STEPS[3].title}</h2>
            <div>
              <label className={labelClass}>Numéro du dossier</label>
              <div className="rounded-lg border border-white/20 bg-white/[0.04] px-3.5 py-2.5 text-[15px] text-white font-mono tracking-wider">
                {generatedNumeroDossier || "—"}
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">Généré automatiquement à l&apos;arrivée sur cette étape.</p>
            </div>
            <div>
              <label className={labelClass}>Date d&apos;entrée en détention *</label>
              <input
                type="date"
                value={dateEntree}
                onChange={(e) => setDateEntree(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Juridiction près</label>
                <select
                  value={juridictionId}
                  onChange={(e) => {
                    setJuridictionId(e.target.value);
                    setParquetId("");
                  }}
                  disabled={parquetChosen}
                  className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/[0.02]`}
                  title={parquetChosen ? "Désélectionnez le parquet pour choisir une juridiction" : undefined}
                >
                  <option value="">—</option>
                  {juridictions.map((j) => (
                    <option key={j.id} value={j.id}>{j.nom} près</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Parquet (nom + près)</label>
                <select
                  value={parquetId}
                  onChange={(e) => {
                    setParquetId(e.target.value);
                    setJuridictionId("");
                  }}
                  disabled={juridictionChosen}
                  className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/[0.02]`}
                  title={juridictionChosen ? "Désélectionnez la juridiction pour choisir un parquet" : undefined}
                >
                  <option value="">—</option>
                  {parquets.map((p) => (
                    <option key={p.id} value={p.id}>{p.nom} près</option>
                  ))}
                </select>
                <p className="mt-2 text-[11px] text-zinc-500">Choisir l’un ou l’autre, pas les deux.</p>
              </div>
            </div>
            <div>
              <label className={labelClass}>Juridiction bas parquet</label>
              <input
                type="text"
                value={juridictionBasParquet}
                onChange={(e) => setJuridictionBasParquet(e.target.value)}
                className={inputClass}
              />
            </div>
          </section>
        )}

        {/* Étape 5 : Prévention et observation */}
        {step === 5 && (
          <section className="step-enter rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-6">
            <h2 className="text-[15px] font-semibold text-white">{STEPS[4].title}</h2>
            <div>
              <label className={labelClass}>Prévention (motif de détention) *</label>
              <textarea
                value={prevention}
                onChange={(e) => setPrevention(e.target.value)}
                required
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="Décrire le motif de détention"
              />
            </div>
            <div>
              <label className={labelClass}>Observation (état de la procédure)</label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="État actuel de la procédure"
              />
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 4 && !isPolicierOuMilitaire) setStep(2);
                else setStep(step - 1);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] px-4 py-2.5 text-[13px] font-medium text-zinc-300 hover:bg-white/5 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>
          ) : (
            <Link
              href="/dashboard/dossiers"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] px-4 py-2.5 text-[13px] font-medium text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition"
            >
              Annuler
            </Link>
          )}
          <div className="flex-1" />
          {step < 5 ? (
            <button
              type="submit"
              disabled={(step === 2 && !canGoStep3) || (step === 4 && !canGoStep4)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50 disabled:pointer-events-none transition"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50 disabled:pointer-events-none transition"
            >
              {loading ? "Création…" : "Créer le dossier"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
