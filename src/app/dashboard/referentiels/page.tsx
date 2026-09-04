"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X, Settings, Plus } from "lucide-react";
import { CIRCONSCRIPTIONS_RDC } from "@/lib/circonscriptions-rdc";
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
  circonscription?: string | null;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#123a7a]/40 focus:ring-2 focus:ring-[#123a7a]/10";
const labelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400";

const btnIcon = "h-3.5 w-3.5";
const btnGhost =
  "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50";
const btnPrimary =
  "inline-flex items-center gap-1.5 rounded-xl bg-[#0b1f4a] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#123a7a] disabled:opacity-50";
const btnAmber =
  "inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition hover:bg-amber-300 disabled:opacity-50";
const btnDanger =
  "inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-[12px] font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50";

export default function ReferentielsPage() {
  const router = useRouter();
  const [juridictions, setJuridictions] = useState<Juridiction[]>([]);
  const [parquets, setParquets] = useState<Parquet[]>([]);
  const [loadingJ, setLoadingJ] = useState(true);
  const [loadingP, setLoadingP] = useState(true);

  const [juridictionNom, setJuridictionNom] = useState("");
  const [juridictionCode, setJuridictionCode] = useState("");
  const [juridictionError, setJuridictionError] = useState("");
  const [juridictionSubmitting, setJuridictionSubmitting] = useState(false);

  const [parquetNom, setParquetNom] = useState("");
  const [parquetCode, setParquetCode] = useState("");
  const [parquetJuridictionId, setParquetJuridictionId] = useState("");
  const [parquetCirconscription, setParquetCirconscription] = useState("");
  const [parquetError, setParquetError] = useState("");
  const [parquetSubmitting, setParquetSubmitting] = useState(false);

  const [editingJuridictionId, setEditingJuridictionId] = useState<string | null>(null);
  const [editJNom, setEditJNom] = useState("");
  const [editJCode, setEditJCode] = useState("");
  const [savingJId, setSavingJId] = useState<string | null>(null);
  const [deletingJId, setDeletingJId] = useState<string | null>(null);

  const [editingParquetId, setEditingParquetId] = useState<string | null>(null);
  const [editPNom, setEditPNom] = useState("");
  const [editPCode, setEditPCode] = useState("");
  const [editPJuridictionId, setEditPJuridictionId] = useState("");
  const [editPCirconscription, setEditPCirconscription] = useState("");
  const [savingPId, setSavingPId] = useState<string | null>(null);
  const [deletingPId, setDeletingPId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/juridictions", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) router.replace("/login");
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data && Array.isArray((data as { list?: unknown }).list) ? (data as { list: Juridiction[] }).list : []);
        setJuridictions(list);
      })
      .catch(() => setJuridictions([]))
      .finally(() => setLoadingJ(false));
  }, [router]);

  useEffect(() => {
    fetch("/api/parquets", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) router.replace("/login");
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data && Array.isArray((data as { list?: unknown }).list) ? (data as { list: Parquet[] }).list : []);
        setParquets(list);
      })
      .catch(() => setParquets([]))
      .finally(() => setLoadingP(false));
  }, [router]);

  function addJuridiction(e: React.FormEvent) {
    e.preventDefault();
    setJuridictionError("");
    setJuridictionSubmitting(true);
    fetch("/api/juridictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nom: juridictionNom.trim(), code: juridictionCode.trim() || undefined }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setJuridictionError(data.error);
          toast.error(data.error);
          return;
        }
        setJuridictions((prev) => [...prev, data].sort((a, b) => a.nom.localeCompare(b.nom)));
        setJuridictionNom("");
        setJuridictionCode("");
        toast.success("Juridiction ajoutée");
      })
      .catch(() => {
        setJuridictionError("Erreur de connexion");
        toast.error("Erreur de connexion");
      })
      .finally(() => setJuridictionSubmitting(false));
  }

  function addParquet(e: React.FormEvent) {
    e.preventDefault();
    setParquetError("");
    setParquetSubmitting(true);
    fetch("/api/parquets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        nom: parquetNom.trim(),
        code: parquetCode.trim() || undefined,
        juridictionId: parquetJuridictionId.trim() || null,
        circonscription: parquetCirconscription.trim() || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setParquetError(data.error);
          toast.error(data.error);
          return;
        }
        setParquets((prev) => [...prev, data].sort((a, b) => a.nom.localeCompare(b.nom)));
        setParquetNom("");
        setParquetCode("");
        setParquetJuridictionId("");
        setParquetCirconscription("");
        toast.success("Parquet ajouté");
      })
      .catch(() => {
        setParquetError("Erreur de connexion");
        toast.error("Erreur de connexion");
      })
      .finally(() => setParquetSubmitting(false));
  }

  function startEditJuridiction(j: Juridiction) {
    setEditingJuridictionId(j.id);
    setEditJNom(j.nom);
    setEditJCode(j.code ?? "");
    setJuridictionError("");
  }

  function cancelEditJuridiction() {
    setEditingJuridictionId(null);
    setEditJNom("");
    setEditJCode("");
  }

  function saveJuridiction(id: string) {
    setJuridictionError("");
    setSavingJId(id);
    fetch(`/api/juridictions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nom: editJNom.trim(), code: editJCode.trim() || null }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setJuridictionError(data.error);
          toast.error(data.error);
          return;
        }
        setJuridictions((prev) =>
          prev.map((x) => (x.id === id ? { ...x, nom: data.nom, code: data.code } : x)).sort((a, b) => a.nom.localeCompare(b.nom))
        );
        setEditingJuridictionId(null);
        setEditJNom("");
        setEditJCode("");
        toast.success("Juridiction modifiée");
      })
      .catch(() => {
        setJuridictionError("Erreur de connexion");
        toast.error("Erreur de connexion");
      })
      .finally(() => setSavingJId(null));
  }

  function deleteJuridiction(id: string) {
    if (!confirm("Supprimer cette juridiction ? Les parquets rattachés empêcheront la suppression.")) return;
    setJuridictionError("");
    setDeletingJId(id);
    fetch(`/api/juridictions/${id}`, { method: "DELETE", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setJuridictionError(data.error);
          toast.error(data.error);
          return;
        }
        setJuridictions((prev) => prev.filter((x) => x.id !== id));
        setEditingJuridictionId((curr) => (curr === id ? null : curr));
        toast.success("Juridiction supprimée");
      })
      .catch(() => {
        setJuridictionError("Erreur de connexion");
        toast.error("Erreur de connexion");
      })
      .finally(() => setDeletingJId(null));
  }

  function startEditParquet(p: Parquet) {
    setEditingParquetId(p.id);
    setEditPNom(p.nom);
    setEditPCode(p.code ?? "");
    setEditPJuridictionId(p.juridictionId ?? "");
    setEditPCirconscription(p.circonscription ?? "");
    setParquetError("");
  }

  function cancelEditParquet() {
    setEditingParquetId(null);
    setEditPNom("");
    setEditPCode("");
    setEditPJuridictionId("");
    setEditPCirconscription("");
  }

  function saveParquet(id: string) {
    setParquetError("");
    setSavingPId(id);
    fetch(`/api/parquets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        nom: editPNom.trim(),
        code: editPCode.trim() || null,
        juridictionId: editPJuridictionId.trim() || null,
        circonscription: editPCirconscription.trim() || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setParquetError(data.error);
          toast.error(data.error);
          return;
        }
        setParquets((prev) =>
          prev
            .map((x) =>
              x.id === id
                ? { ...x, nom: data.nom, code: data.code, juridictionId: data.juridictionId, circonscription: data.circonscription }
                : x
            )
            .sort((a, b) => a.nom.localeCompare(b.nom))
        );
        setEditingParquetId(null);
        setEditPNom("");
        setEditPCode("");
        setEditPJuridictionId("");
        setEditPCirconscription("");
        toast.success("Parquet modifié");
      })
      .catch(() => {
        setParquetError("Erreur de connexion");
        toast.error("Erreur de connexion");
      })
      .finally(() => setSavingPId(null));
  }

  function deleteParquet(id: string) {
    if (!confirm("Supprimer ce parquet ?")) return;
    setParquetError("");
    setDeletingPId(id);
    fetch(`/api/parquets/${id}`, { method: "DELETE", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setParquetError(data.error);
          toast.error(data.error);
          return;
        }
        setParquets((prev) => prev.filter((x) => x.id !== id));
        setEditingParquetId((curr) => (curr === id ? null : curr));
        toast.success("Parquet supprimé");
      })
      .catch(() => {
        setParquetError("Erreur de connexion");
        toast.error("Erreur de connexion");
      })
      .finally(() => setDeletingPId(null));
  }

  return (
    <div className="mx-auto w-full max-w-5xl animate-fade-in">
      <PageHero
        title="Référentiels"
        subtitle="Juridictions et parquets utilisés dans les dossiers."
        icon={Settings}
        accent="from-sky-400/15 to-transparent"
      />

      <div className="space-y-5">
        {/* Juridictions près */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <h2 className="mb-4 text-[15px] font-semibold text-slate-900">Juridictions près</h2>
          {juridictionError && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
              {juridictionError}
            </p>
          )}
          <form onSubmit={addJuridiction} className="mb-5 flex flex-wrap items-end gap-3">
            <div className="min-w-[180px] flex-1">
              <label className={labelClass}>Juridiction près (nom) *</label>
              <input
                type="text"
                value={juridictionNom}
                onChange={(e) => setJuridictionNom(e.target.value)}
                required
                className={inputClass}
                placeholder="Ex. Tribunal de Grande Instance"
              />
            </div>
            <div className="w-32">
              <label className={labelClass}>Code</label>
              <input
                type="text"
                value={juridictionCode}
                onChange={(e) => setJuridictionCode(e.target.value)}
                className={inputClass}
                placeholder="Optionnel"
              />
            </div>
            <button type="submit" disabled={juridictionSubmitting} className={btnAmber}>
              <Plus className={btnIcon} />
              {juridictionSubmitting ? "Ajout…" : "Ajouter"}
            </button>
          </form>
          {loadingJ ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : juridictions.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-[13px] text-slate-500">
              Aucune juridiction. Ajoutez-en une ci-dessus.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:grid-cols-[1fr_100px_180px]">
                <div>Juridiction près</div>
                <div>Code</div>
                <div className="text-right">Actions</div>
              </div>
              {juridictions.map((j) => (
                <div
                  key={j.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-slate-100 px-4 py-3 text-[14px] last:border-0 sm:grid-cols-[1fr_100px_180px]"
                >
                  {editingJuridictionId === j.id ? (
                    <>
                      <input
                        type="text"
                        value={editJNom}
                        onChange={(e) => setEditJNom(e.target.value)}
                        className={`${inputClass} py-2 text-[14px]`}
                        placeholder="Nom"
                      />
                      <input
                        type="text"
                        value={editJCode}
                        onChange={(e) => setEditJCode(e.target.value)}
                        className={`${inputClass} w-full min-w-[80px] py-2 text-[14px]`}
                        placeholder="Code"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => saveJuridiction(j.id)}
                          disabled={!editJNom.trim() || savingJId === j.id}
                          className={btnPrimary}
                        >
                          <Check className={btnIcon} />
                          OK
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditJuridiction}
                          disabled={savingJId === j.id}
                          className={btnGhost}
                        >
                          <X className={btnIcon} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium text-slate-900">{j.nom} près</div>
                      <div className="font-mono text-[13px] text-slate-500">{j.code ?? "—"}</div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEditJuridiction(j)}
                          className={btnGhost}
                        >
                          <Pencil className={btnIcon} />
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteJuridiction(j.id)}
                          disabled={deletingJId === j.id}
                          className={btnDanger}
                        >
                          <Trash2 className={btnIcon} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Parquets */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <h2 className="mb-4 text-[15px] font-semibold text-slate-900">Parquets</h2>
          {parquetError && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
              {parquetError}
            </p>
          )}
          <form onSubmit={addParquet} className="mb-5 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Nom (Parquet … près) *</label>
                <input
                  type="text"
                  value={parquetNom}
                  onChange={(e) => setParquetNom(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Ex. Parquet de Makala"
                />
              </div>
              <div>
                <label className={labelClass}>Code</label>
                <input
                  type="text"
                  value={parquetCode}
                  onChange={(e) => setParquetCode(e.target.value)}
                  className={inputClass}
                  placeholder="Optionnel"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-[200px]">
                <label className={labelClass}>Juridiction près</label>
                <select
                  value={parquetJuridictionId}
                  onChange={(e) => setParquetJuridictionId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Aucune —</option>
                  {juridictions.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nom} près
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[200px]">
                <label className={labelClass}>Circonscription (ville)</label>
                <select
                  value={parquetCirconscription}
                  onChange={(e) => setParquetCirconscription(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Aucune —</option>
                  {CIRCONSCRIPTIONS_RDC.map((ville) => (
                    <option key={ville} value={ville}>
                      {ville}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" disabled={parquetSubmitting} className={btnAmber}>
              <Plus className={btnIcon} />
              {parquetSubmitting ? "Ajout…" : "Ajouter"}
            </button>
          </form>
          {loadingP ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : parquets.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-[13px] text-slate-500">
              Aucun parquet. Ajoutez-en un ci-dessus.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[1fr_80px_1fr_120px_160px] gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <div>Parquet près</div>
                  <div>Code</div>
                  <div>Juridiction</div>
                  <div>Circonscription</div>
                  <div className="text-right">Actions</div>
                </div>
                {parquets.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[1fr_80px_1fr_120px_160px] items-center gap-2 border-b border-slate-100 px-4 py-3 text-[14px] last:border-0"
                  >
                    {editingParquetId === p.id ? (
                      <>
                        <input
                          type="text"
                          value={editPNom}
                          onChange={(e) => setEditPNom(e.target.value)}
                          className={`${inputClass} py-2 text-[14px]`}
                          placeholder="Nom"
                        />
                        <input
                          type="text"
                          value={editPCode}
                          onChange={(e) => setEditPCode(e.target.value)}
                          className={`${inputClass} py-2 text-[14px]`}
                          placeholder="Code"
                        />
                        <select
                          value={editPJuridictionId}
                          onChange={(e) => setEditPJuridictionId(e.target.value)}
                          className={`${inputClass} py-2 text-[14px]`}
                        >
                          <option value="">— Aucune —</option>
                          {juridictions.map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.nom} près
                            </option>
                          ))}
                        </select>
                        <select
                          value={editPCirconscription}
                          onChange={(e) => setEditPCirconscription(e.target.value)}
                          className={`${inputClass} py-2 text-[14px]`}
                        >
                          <option value="">—</option>
                          {CIRCONSCRIPTIONS_RDC.map((ville) => (
                            <option key={ville} value={ville}>
                              {ville}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => saveParquet(p.id)}
                            disabled={!editPNom.trim() || savingPId === p.id}
                            className={btnPrimary}
                          >
                            <Check className={btnIcon} />
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditParquet}
                            disabled={savingPId === p.id}
                            className={btnGhost}
                          >
                            <X className={btnIcon} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-medium text-slate-900">{p.nom} près</div>
                        <div className="font-mono text-[13px] text-slate-500">{p.code ?? "—"}</div>
                        <div className="text-[13px] text-slate-500">
                          {p.juridictionId
                            ? (juridictions.find((j) => j.id === p.juridictionId)?.nom ?? "—") +
                              " près"
                            : "—"}
                        </div>
                        <div className="text-[13px] text-slate-500">
                          {p.circonscription ?? "—"}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEditParquet(p)}
                            className={btnGhost}
                          >
                            <Pencil className={btnIcon} />
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteParquet(p.id)}
                            disabled={deletingPId === p.id}
                            className={btnDanger}
                          >
                            <Trash2 className={btnIcon} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
