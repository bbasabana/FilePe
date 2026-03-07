"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, X, Check, GraduationCap } from "lucide-react";

interface FormationItem {
  id: string;
  intitule: string;
  organisme: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  observation: string | null;
}

type Categorie = "civil" | "policier" | "militaire";
type EtatCivil = "marie" | "celibataire" | "veuf";
type StatusDetenu = "prevenu" | "detenu" | "autre";

interface DossierDetail {
  id: string;
  numeroDossier: string;
  dateEntree: string;
  juridictionId: string | null;
  parquetId: string | null;
  juridictionNom?: string | null;
  parquetNom?: string | null;
  juridictionBasParquet: string | null;
  prevention: string;
  observation: string | null;
  detenu: {
    id: string;
    categorie?: Categorie;
    nom: string;
    prenom: string;
    poste: string | null;
    lieuNaissance: string | null;
    dateNaissance: string | null;
    nationalite: string | null;
    adresse: string | null;
    matricule?: string | null;
    grade?: string | null;
    fonction?: string | null;
    unite?: string | null;
    detachement?: string | null;
    etatCivil?: EtatCivil | null;
    status?: StatusDetenu | null;
  } | null;
}

export default function DossierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<DossierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Partial<DossierDetail>>({});
  const [formationsList, setFormationsList] = useState<FormationItem[]>([]);
  const [formationsLoading, setFormationsLoading] = useState(false);
  const [formationIntitule, setFormationIntitule] = useState("");
  const [formationOrganisme, setFormationOrganisme] = useState("");
  const [formationDateDebut, setFormationDateDebut] = useState("");
  const [formationDateFin, setFormationDateFin] = useState("");
  const [formationObservation, setFormationObservation] = useState("");
  const [formationSubmitting, setFormationSubmitting] = useState(false);
  const [formationError, setFormationError] = useState("");

  useEffect(() => {
    fetch(`/api/dossiers/${id}`, { credentials: "include" })
      .then((res) => {
        if (res.status === 401) router.replace("/login");
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((d: DossierDetail) => {
        setData(d);
        setForm({
          numeroDossier: d.numeroDossier,
          dateEntree: d.dateEntree,
          juridictionBasParquet: d.juridictionBasParquet ?? "",
          prevention: d.prevention,
          observation: d.observation ?? "",
          detenu: d.detenu
            ? {
                ...d.detenu,
                poste: d.detenu.poste ?? "",
                lieuNaissance: d.detenu.lieuNaissance ?? "",
                dateNaissance: d.detenu.dateNaissance ?? "",
                nationalite: d.detenu.nationalite ?? "",
                adresse: d.detenu.adresse ?? "",
                matricule: d.detenu.matricule ?? "",
                grade: d.detenu.grade ?? "",
                fonction: d.detenu.fonction ?? "",
                unite: d.detenu.unite ?? "",
                detachement: d.detenu.detachement ?? "",
              }
            : null,
        });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!id) return;
    setFormationsLoading(true);
    fetch(`/api/dossiers/${id}/formations`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then(setFormationsList)
      .catch(() => setFormationsList([]))
      .finally(() => setFormationsLoading(false));
  }, [id]);

  async function addFormation(e: React.FormEvent) {
    e.preventDefault();
    setFormationError("");
    setFormationSubmitting(true);
    try {
      const res = await fetch(`/api/dossiers/${id}/formations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          intitule: formationIntitule.trim(),
          organisme: formationOrganisme.trim() || null,
          dateDebut: formationDateDebut || null,
          dateFin: formationDateFin || null,
          observation: formationObservation.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error ?? "Erreur";
        setFormationError(msg);
        toast.error(msg);
        return;
      }
      setFormationsList((prev) => [...prev, json]);
      setFormationIntitule("");
      setFormationOrganisme("");
      setFormationDateDebut("");
      setFormationDateFin("");
      setFormationObservation("");
      toast.success("Formation ajoutée");
    } catch {
      setFormationError("Erreur de connexion");
      toast.error("Erreur de connexion");
    } finally {
      setFormationSubmitting(false);
    }
  }

  async function handleSave() {
    if (!data) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/dossiers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          numeroDossier: form.numeroDossier,
          dateEntree: form.dateEntree,
          juridictionBasParquet: form.juridictionBasParquet || null,
          prevention: form.prevention,
          observation: form.observation || null,
          nom: form.detenu?.nom,
          prenom: form.detenu?.prenom,
          poste: form.detenu?.poste || null,
          lieuNaissance: form.detenu?.lieuNaissance || null,
          dateNaissance: form.detenu?.dateNaissance || null,
          nationalite: form.detenu?.nationalite || null,
          adresse: form.detenu?.adresse || null,
          categorie: form.detenu?.categorie,
          matricule: form.detenu?.matricule || null,
          grade: form.detenu?.grade || null,
          fonction: form.detenu?.fonction || null,
          unite: form.detenu?.unite || null,
          detachement: form.detenu?.detachement || null,
          etatCivil: form.detenu?.etatCivil || null,
          status: form.detenu?.status || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        const msg = d.error ?? "Erreur";
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success("Dossier enregistré");
      setData((prev) =>
        prev
          ? {
              ...prev,
              numeroDossier: form.numeroDossier ?? prev.numeroDossier,
              dateEntree: form.dateEntree ?? prev.dateEntree,
              juridictionBasParquet: form.juridictionBasParquet ?? prev.juridictionBasParquet,
              prevention: form.prevention ?? prev.prevention,
              observation: form.observation ?? prev.observation,
              detenu: form.detenu
                ? {
                    ...prev.detenu!,
                    ...form.detenu,
                    poste: form.detenu.poste ?? null,
                    lieuNaissance: form.detenu.lieuNaissance ?? null,
                    dateNaissance: form.detenu.dateNaissance ?? null,
                    nationalite: form.detenu.nationalite ?? null,
                    adresse: form.detenu.adresse ?? null,
                    matricule: form.detenu.matricule ?? null,
                    grade: form.detenu.grade ?? null,
                    fonction: form.detenu.fonction ?? null,
                    unite: form.detenu.unite ?? null,
                    detachement: form.detenu.detachement ?? null,
                    etatCivil: form.detenu.etatCivil ?? null,
                    status: form.detenu.status ?? null,
                  }
                : prev.detenu,
            }
          : null
      );
      setEditing(false);
    } catch {
      setError("Erreur de connexion");
      toast.error("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl w-full flex items-center justify-center py-16">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="loader-dot h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-5xl w-full">
        <p className="text-zinc-400 text-sm">Dossier introuvable.</p>
        <Link href="/dashboard/dossiers" className="mt-3 inline-block text-xs text-primary hover:underline">
          Liste des dossiers
        </Link>
      </div>
    );
  }

  const d = data.detenu;

  const inputClass = "w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[13px] text-white";
  const labelClass = "block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1";

  return (
    <div className="max-w-5xl w-full animate-fade-in">
      {/* Header + résumé compact */}
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Dossier {data.numeroDossier}
            </h1>
            <p className="text-zinc-400 mt-0.5 text-sm">
              {d ? `${d.nom} ${d.prenom}` : "—"}
            </p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dim disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm({
                    numeroDossier: data.numeroDossier,
                    dateEntree: data.dateEntree,
                    juridictionBasParquet: data.juridictionBasParquet ?? "",
                    prevention: data.prevention,
                    observation: data.observation ?? "",
                    detenu: data.detenu
                      ? {
                          ...data.detenu,
                          poste: data.detenu.poste ?? "",
                          lieuNaissance: data.detenu.lieuNaissance ?? "",
                          dateNaissance: data.detenu.dateNaissance ?? "",
                          nationalite: data.detenu.nationalite ?? "",
                          adresse: data.detenu.adresse ?? "",
                          matricule: data.detenu.matricule ?? "",
                          grade: data.detenu.grade ?? "",
                          fonction: data.detenu.fonction ?? "",
                          unite: data.detenu.unite ?? "",
                          detachement: data.detenu.detachement ?? "",
                        }
                      : null,
                  });
                }}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
              >
                <X className="h-3.5 w-3.5" />
                Annuler
              </button>
            </div>
          )}
        </div>
        {/* Bandeau résumé */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 rounded-lg bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-sm">
          <span className="text-zinc-500">N° dossier</span>
          <span className="text-white font-mono">{data.numeroDossier}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">Entrée</span>
          <span className="text-white">{data.dateEntree}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">Juridiction</span>
          <span className="text-white">{data.juridictionNom ? `${data.juridictionNom} près` : "—"}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">Parquet</span>
          <span className="text-white">{data.parquetNom ? `${data.parquetNom} près` : "—"}</span>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Identité */}
        <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <h2 className="text-[13px] font-semibold text-white mb-3">Identité du détenu</h2>
          {editing && form.detenu ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Catégorie</label>
                  <select
                    value={form.detenu.categorie ?? "civil"}
                    onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, categorie: e.target.value as Categorie } }))}
                    className={inputClass}
                  >
                    <option value="civil">Civil</option>
                    <option value="policier">Policier</option>
                    <option value="militaire">Militaire</option>
                  </select>
                </div>
                <div />
                <div>
                  <label className={labelClass}>Nom</label>
                  <input value={form.detenu.nom} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, nom: e.target.value } }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Prénom</label>
                  <input value={form.detenu.prenom} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, prenom: e.target.value } }))} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Poste</label>
                  <input value={form.detenu.poste ?? ""} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, poste: e.target.value } }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Lieu naissance</label>
                  <input value={form.detenu.lieuNaissance ?? ""} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, lieuNaissance: e.target.value } }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Date naissance</label>
                  <input type="date" value={form.detenu.dateNaissance ?? ""} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, dateNaissance: e.target.value } }))} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Nationalité</label>
                  <input value={form.detenu.nationalite ?? ""} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, nationalite: e.target.value } }))} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Adresse</label>
                  <textarea value={form.detenu.adresse ?? ""} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, adresse: e.target.value } }))} rows={2} className={`${inputClass} resize-none`} />
                </div>
              </div>
              {(form.detenu.categorie === "policier" || form.detenu.categorie === "militaire") && (
                <div className="border-t border-white/[0.06] pt-3 space-y-3">
                  <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    {form.detenu.categorie === "policier" ? "Policier / Militaire" : "Militaire"}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelClass}>Matricule</label><input value={form.detenu.matricule ?? ""} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, matricule: e.target.value } }))} className={inputClass} /></div>
                    <div><label className={labelClass}>Grade</label><input value={form.detenu.grade ?? ""} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, grade: e.target.value } }))} className={inputClass} /></div>
                    <div className="col-span-2"><label className={labelClass}>Fonction</label><input value={form.detenu.fonction ?? ""} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, fonction: e.target.value } }))} className={inputClass} /></div>
                    <div><label className={labelClass}>Unité</label><input value={form.detenu.unite ?? ""} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, unite: e.target.value } }))} className={inputClass} /></div>
                    <div><label className={labelClass}>Détachement</label><input value={form.detenu.detachement ?? ""} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, detachement: e.target.value } }))} className={inputClass} /></div>
                    <div><label className={labelClass}>État civil</label><select value={form.detenu.etatCivil ?? ""} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, etatCivil: (e.target.value || null) as EtatCivil | null } }))} className={inputClass}><option value="">—</option><option value="marie">Marié(e)</option><option value="celibataire">Célibataire</option><option value="veuf">Veuve/Veuf</option></select></div>
                    <div><label className={labelClass}>Statut</label><select value={form.detenu.status ?? ""} onChange={(e) => setForm((f) => ({ ...f, detenu: { ...f.detenu!, status: (e.target.value || null) as StatusDetenu | null } }))} className={inputClass}><option value="">—</option><option value="prevenu">Prévenu</option><option value="detenu">Détenu</option><option value="autre">Autre</option></select></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
              {d?.categorie && (<><dt className="text-zinc-500">Catégorie</dt><dd className="text-white capitalize">{d.categorie}</dd></>)}
              <><dt className="text-zinc-500">Nom / Prénom</dt><dd className="text-white">{d ? `${d.nom} ${d.prenom}` : "—"}</dd></>
              <><dt className="text-zinc-500">Poste</dt><dd className="text-white">{d?.poste ?? "—"}</dd></>
              <><dt className="text-zinc-500">Naissance</dt><dd className="text-white">{d ? [d.lieuNaissance, d.dateNaissance].filter(Boolean).join(" · ") || "—" : "—"}</dd></>
              <><dt className="text-zinc-500">Nationalité</dt><dd className="text-white">{d?.nationalite ?? "—"}</dd></>
              <><dt className="text-zinc-500">Adresse</dt><dd className="text-white col-span-2">{d?.adresse ?? "—"}</dd></>
              {(d?.categorie === "policier" || d?.categorie === "militaire") && (
                <>
                  {d?.matricule && (<><dt className="text-zinc-500">Matricule</dt><dd className="text-white">{d.matricule}</dd></>)}
                  {d?.grade && (<><dt className="text-zinc-500">Grade</dt><dd className="text-white">{d.grade}</dd></>)}
                  {d?.fonction && (<><dt className="text-zinc-500">Fonction</dt><dd className="text-white">{d.fonction}</dd></>)}
                  {d?.unite && (<><dt className="text-zinc-500">Unité</dt><dd className="text-white">{d.unite}</dd></>)}
                  {d?.detachement && (<><dt className="text-zinc-500">Détachement</dt><dd className="text-white">{d.detachement}</dd></>)}
                  {d?.etatCivil && (<><dt className="text-zinc-500">État civil</dt><dd className="text-white">{d.etatCivil === "marie" ? "Marié(e)" : d.etatCivil === "celibataire" ? "Célibataire" : "Veuve/Veuf"}</dd></>)}
                  {d?.status && (<><dt className="text-zinc-500">Statut</dt><dd className="text-white capitalize">{d.status}</dd></>)}
                </>
              )}
            </dl>
          )}
        </section>

        {/* Colonne droite : Dossier + Prévention */}
        <div className="space-y-4">
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <h2 className="text-[13px] font-semibold text-white mb-3">Dossier</h2>
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>N° dossier</label><input value={form.numeroDossier ?? ""} onChange={(e) => setForm((f) => ({ ...f, numeroDossier: e.target.value }))} className={`${inputClass} font-mono`} /></div>
                  <div><label className={labelClass}>Date entrée</label><input type="date" value={form.dateEntree ?? ""} onChange={(e) => setForm((f) => ({ ...f, dateEntree: e.target.value }))} className={inputClass} /></div>
                </div>
                <div><label className={labelClass}>Juridiction bas parquet</label><input value={form.juridictionBasParquet ?? ""} onChange={(e) => setForm((f) => ({ ...f, juridictionBasParquet: e.target.value }))} className={inputClass} /></div>
              </div>
            ) : (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                <><dt className="text-zinc-500">N° dossier</dt><dd className="text-white font-mono">{data.numeroDossier}</dd></>
                <><dt className="text-zinc-500">Date entrée</dt><dd className="text-white">{data.dateEntree}</dd></>
                <><dt className="text-zinc-500">Juridiction près</dt><dd className="text-white">{data.juridictionNom ? `${data.juridictionNom} près` : "—"}</dd></>
                <><dt className="text-zinc-500">Parquet</dt><dd className="text-white">{data.parquetNom ? `${data.parquetNom} près` : "—"}</dd></>
                <><dt className="text-zinc-500">J. bas parquet</dt><dd className="text-white col-span-2">{data.juridictionBasParquet ?? "—"}</dd></>
              </dl>
            )}
          </section>

          <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <h2 className="text-[13px] font-semibold text-white mb-3">Prévention et observation</h2>
            {editing ? (
              <div className="space-y-3">
                <div><label className={labelClass}>Prévention</label><textarea value={form.prevention ?? ""} onChange={(e) => setForm((f) => ({ ...f, prevention: e.target.value }))} rows={2} className={`${inputClass} resize-none`} /></div>
                <div><label className={labelClass}>Observation</label><textarea value={form.observation ?? ""} onChange={(e) => setForm((f) => ({ ...f, observation: e.target.value }))} rows={2} className={`${inputClass} resize-none`} /></div>
              </div>
            ) : (
              <dl className="space-y-2 text-[13px]">
                <div><dt className="text-zinc-500 mb-0.5">Prévention</dt><dd className="text-white whitespace-pre-wrap leading-snug">{data.prevention || "—"}</dd></div>
                <div><dt className="text-zinc-500 mb-0.5">Observation</dt><dd className="text-white whitespace-pre-wrap leading-snug">{data.observation ?? "—"}</dd></div>
              </dl>
            )}
          </section>
        </div>
      </div>

      {/* Formations — pleine largeur */}
      <section className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-white mb-3">
          <GraduationCap className="h-4 w-4 text-primary" />
          Formations
        </h2>
        {formationError && (
          <p className="mb-3 text-xs text-red-400">{formationError}</p>
        )}
        <form onSubmit={addFormation} className="space-y-3 mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[160px] flex-1">
              <label className={labelClass}>Intitulé *</label>
              <input type="text" value={formationIntitule} onChange={(e) => setFormationIntitule(e.target.value)} required className={inputClass} placeholder="Ex. Alphabétisation" />
            </div>
            <div className="min-w-[120px]">
              <label className={labelClass}>Organisme</label>
              <input type="text" value={formationOrganisme} onChange={(e) => setFormationOrganisme(e.target.value)} className={inputClass} placeholder="Optionnel" />
            </div>
            <div className="min-w-[100px]">
              <label className={labelClass}>Début</label>
              <input type="date" value={formationDateDebut} onChange={(e) => setFormationDateDebut(e.target.value)} className={inputClass} />
            </div>
            <div className="min-w-[100px]">
              <label className={labelClass}>Fin</label>
              <input type="date" value={formationDateFin} onChange={(e) => setFormationDateFin(e.target.value)} className={inputClass} />
            </div>
            <button type="submit" disabled={formationSubmitting} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-dim disabled:opacity-50">
              {formationSubmitting ? "Ajout…" : "Ajouter"}
            </button>
          </div>
          <div className="max-w-md">
            <label className={labelClass}>Observation</label>
            <input type="text" value={formationObservation} onChange={(e) => setFormationObservation(e.target.value)} className={inputClass} placeholder="Optionnel" />
          </div>
        </form>
        {formationsLoading ? (
          <p className="text-xs text-zinc-500">Chargement…</p>
        ) : formationsList.length === 0 ? (
          <p className="text-[13px] text-zinc-500">Aucune formation.</p>
        ) : (
          <ul className="space-y-2">
            {formationsList.map((f) => (
              <li key={f.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[13px]">
                <span className="font-medium text-white">{f.intitule}</span>
                {(f.organisme || f.dateDebut || f.dateFin) && (
                  <span className="text-zinc-500 text-xs">
                    {[f.organisme, f.dateDebut && f.dateFin ? `${f.dateDebut} → ${f.dateFin}` : null].filter(Boolean).join(" · ")}
                  </span>
                )}
                {f.observation && <span className="w-full text-zinc-500 text-xs mt-0.5 block">{f.observation}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
