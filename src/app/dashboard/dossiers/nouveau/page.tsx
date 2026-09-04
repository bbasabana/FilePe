"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, User, Shield, Badge, FilePlus } from "lucide-react";
import { generateNumeroDossier } from "@/lib/numero-dossier";
import PageHero from "@/components/PageHero";

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
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#123a7a]/40 focus:ring-2 focus:ring-[#123a7a]/10";
  const labelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400";
  const sectionClass =
    "step-enter rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/40 space-y-5 sm:p-6";

  const typeLabel =
    typeFromUrl === "prevenu" ? "prévenu" : typeFromUrl === "detenu" ? "détenu" : "dossier";

  return (
    <div className="mx-auto w-full max-w-3xl animate-fade-in">
      {loading && (
        <div className="form-loader-overlay" aria-busy="true">
          <div className="form-loader-ring" aria-hidden />
          <span className="text-[14px] text-slate-500">Création du dossier…</span>
        </div>
      )}

      <PageHero
        title={`Nouveau ${typeLabel}`}
        subtitle="Catégorie, identité, dossier, prévention et observation."
        icon={FilePlus}
        accent={
          typeFromUrl === "detenu"
            ? "from-amber-400/20 to-transparent"
            : "from-sky-400/20 to-transparent"
        }
      />

      {/* Étapes */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {displaySteps.map((s, i) => {
          const active = currentStepDisplay === i + 1;
          const done = currentStepDisplay > i + 1;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-full px-2.5 py-1.5 transition ${
                  active
                    ? "bg-[#0b1f4a] text-white"
                    : done
                      ? "bg-amber-50 text-amber-800"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                    active
                      ? "bg-amber-400 text-slate-900"
                      : done
                        ? "bg-amber-200/80 text-amber-900"
                        : "bg-white text-slate-400"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="hidden text-[12px] font-medium sm:inline">{s.title}</span>
              </div>
              {i < displaySteps.length - 1 && (
                <div className="h-px w-4 bg-slate-200 sm:w-6" aria-hidden />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {/* Étape 1 : Catégorie */}
        {step === 1 && (
          <section className={sectionClass}>
            <h2 className="text-[15px] font-semibold text-slate-900">{STEPS[0].title}</h2>
            <div>
              <label className={labelClass}>Choisir la catégorie</label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategorie(value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition ${
                      categorie === value
                        ? "border-[#0b1f4a] bg-[#0b1f4a]/5 text-slate-900"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${categorie === value ? "text-[#0b1f4a]" : ""}`} />
                    <span className="text-[13px] font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Étape 2 : Identité */}
        {step === 2 && (
          <section className={sectionClass}>
            <h2 className="text-[15px] font-semibold text-slate-900">{STEPS[1].title}</h2>
            <div className="space-y-4">
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
              {!isPolicierOuMilitaire && (
                <div>
                  <label className={labelClass}>Statut</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Étape 3 : Informations policier / militaire */}
        {step === 3 && isPolicierOuMilitaire && (
          <section className={sectionClass}>
            <h2 className="text-[15px] font-semibold text-slate-900">
              {categorie === "policier" ? "Informations policier" : "Informations militaire"}
            </h2>
            <div className="space-y-4">
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
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
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
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Étape 4 : Dossier */}
        {step === 4 && (
          <section className={sectionClass}>
            <h2 className="text-[15px] font-semibold text-slate-900">{STEPS[3].title}</h2>
            <div>
              <label className={labelClass}>Numéro du dossier</label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-[15px] tracking-wider text-slate-900">
                {generatedNumeroDossier || "—"}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Généré automatiquement à l&apos;arrivée sur cette étape.
              </p>
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
                  className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50`}
                  title={
                    parquetChosen
                      ? "Désélectionnez le parquet pour choisir une juridiction"
                      : undefined
                  }
                >
                  <option value="">—</option>
                  {juridictions.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nom} près
                    </option>
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
                  className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50`}
                  title={
                    juridictionChosen
                      ? "Désélectionnez la juridiction pour choisir un parquet"
                      : undefined
                  }
                >
                  <option value="">—</option>
                  {parquets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} près
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[11px] text-slate-400">
                  Choisir l’un ou l’autre, pas les deux.
                </p>
              </div>
            </div>
            <div>
              <label className={labelClass}>Parquet</label>
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
          <section className={sectionClass}>
            <h2 className="text-[15px] font-semibold text-slate-900">{STEPS[4].title}</h2>
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

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 4 && !isPolicierOuMilitaire) setStep(2);
                else setStep(step - 1);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>
          ) : (
            <Link
              href={
                typeFromUrl === "prevenu"
                  ? "/dashboard/prevenus"
                  : typeFromUrl === "detenu"
                    ? "/dashboard/detenus"
                    : "/dashboard/dossiers"
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Annuler
            </Link>
          )}
          <div className="flex-1" />
          {step < 5 ? (
            <button
              type="submit"
              disabled={(step === 2 && !canGoStep3) || (step === 4 && !canGoStep4)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b1f4a] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#123a7a] disabled:pointer-events-none disabled:opacity-50"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition hover:bg-amber-300 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? "Création…" : "Créer le dossier"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
