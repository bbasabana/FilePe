"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { CIRCONSCRIPTIONS_RDC } from "@/lib/circonscriptions-rdc";

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
  "w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const labelClass = "block text-[12px] font-medium text-zinc-400 mb-1.5";

const btnIcon = "h-4 w-4";
const btnBase =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition";

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
    <div className="max-w-3xl w-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-white tracking-tight">
          Juridictions & Parquets
        </h1>
        <p className="text-zinc-400 mt-1 text-[14px]">
          Gérer les valeurs des listes déroulantes utilisées dans les dossiers.
        </p>
      </div>

      <div className="space-y-8">
        {/* Juridictions près */}
        <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-[15px] font-semibold text-white mb-4">Juridictions près</h2>
          {juridictionError && (
            <p className="mb-4 text-[13px] text-red-400">{juridictionError}</p>
          )}
          <form onSubmit={addJuridiction} className="flex flex-wrap items-end gap-4 mb-6">
            <div className="flex-1 min-w-[180px]">
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
            <button
              type="submit"
              disabled={juridictionSubmitting}
              className="rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50"
            >
              {juridictionSubmitting ? "Ajout…" : "Ajouter"}
            </button>
          </form>
          {loadingJ ? (
            <p className="text-[13px] text-zinc-500">Chargement…</p>
          ) : juridictions.length === 0 ? (
            <p className="text-[14px] text-zinc-500">Aucune juridiction. Ajoutez-en une ci-dessus.</p>
          ) : (
            <div className="rounded-lg border border-white/[0.1] bg-white/[0.02] overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_100px_180px] gap-2 px-4 py-3 text-[12px] font-medium text-zinc-500 uppercase tracking-wider border-b border-white/[0.08]">
                <div>Juridiction près</div>
                <div>Code</div>
                <div className="text-right">Actions</div>
              </div>
              {juridictions.map((j) => (
                <div
                  key={j.id}
                  className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_100px_180px] gap-2 px-4 py-3 items-center border-b border-white/[0.06] last:border-0 text-[14px]"
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
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50"
                        >
                          <Check className={btnIcon} />
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditJuridiction}
                          disabled={savingJId === j.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-[13px] font-medium text-zinc-400 hover:bg-white/5"
                        >
                          <X className={btnIcon} />
                          Annuler
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium text-white">{j.nom} près</div>
                      <div className="text-zinc-400 font-mono text-[13px]">{j.code ?? "—"}</div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEditJuridiction(j)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-[13px] font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
                        >
                          <Pencil className={btnIcon} />
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteJuridiction(j.id)}
                          disabled={deletingJId === j.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-2 text-[13px] font-medium text-red-400 hover:bg-red-500/15 disabled:opacity-50"
                        >
                          <Trash2 className={btnIcon} />
                          Supprimer
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
        <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-[15px] font-semibold text-white mb-4">Parquets</h2>
          {parquetError && (
            <p className="mb-4 text-[13px] text-red-400">{parquetError}</p>
          )}
          <form onSubmit={addParquet} className="space-y-4 mb-6">
            <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-[200px]">
                <label className={labelClass}>Juridiction près</label>
                <select
                  value={parquetJuridictionId}
                  onChange={(e) => setParquetJuridictionId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Aucune —</option>
                  {juridictions.map((j) => (
                    <option key={j.id} value={j.id}>{j.nom} près</option>
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
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <button
                type="submit"
                disabled={parquetSubmitting}
                className="rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50"
              >
                {parquetSubmitting ? "Ajout…" : "Ajouter"}
              </button>
            </div>
          </form>
          {loadingP ? (
            <p className="text-[13px] text-zinc-500">Chargement…</p>
          ) : parquets.length === 0 ? (
            <p className="text-[14px] text-zinc-500">Aucun parquet. Ajoutez-en un ci-dessus.</p>
          ) : (
            <div className="rounded-lg border border-white/[0.1] bg-white/[0.02] overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_1fr_1fr_auto] sm:grid-cols-[1fr_80px_1fr_120px_200px] gap-2 px-4 py-3 text-[12px] font-medium text-zinc-500 uppercase tracking-wider border-b border-white/[0.08]">
                <div>Parquet près</div>
                <div>Code</div>
                <div>Juridiction près</div>
                <div>Circonscription</div>
                <div className="text-right">Actions</div>
              </div>
              {parquets.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[1fr_auto_1fr_1fr_auto] sm:grid-cols-[1fr_80px_1fr_120px_200px] gap-2 px-4 py-3 items-center border-b border-white/[0.06] last:border-0 text-[14px]"
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
                        className={`${inputClass} w-full min-w-[80px] py-2 text-[14px]`}
                        placeholder="Code"
                      />
                      <select
                        value={editPJuridictionId}
                        onChange={(e) => setEditPJuridictionId(e.target.value)}
                        className={`${inputClass} py-2 text-[14px]`}
                      >
                        <option value="">— Aucune —</option>
                        {juridictions.map((j) => (
                          <option key={j.id} value={j.id}>{j.nom} près</option>
                        ))}
                      </select>
                      <select
                        value={editPCirconscription}
                        onChange={(e) => setEditPCirconscription(e.target.value)}
                        className={`${inputClass} py-2 text-[14px]`}
                      >
                        <option value="">—</option>
                        {CIRCONSCRIPTIONS_RDC.map((ville) => (
                          <option key={ville} value={ville}>{ville}</option>
                        ))}
                      </select>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => saveParquet(p.id)}
                          disabled={!editPNom.trim() || savingPId === p.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50"
                        >
                          <Check className={btnIcon} />
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditParquet}
                          disabled={savingPId === p.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-[13px] font-medium text-zinc-400 hover:bg-white/5"
                        >
                          <X className={btnIcon} />
                          Annuler
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium text-white">{p.nom} près</div>
                      <div className="text-zinc-400 font-mono text-[13px]">{p.code ?? "—"}</div>
                      <div className="text-zinc-400 text-[13px]">
                        {p.juridictionId ? (juridictions.find((j) => j.id === p.juridictionId)?.nom ?? "—") + " près" : "—"}
                      </div>
                      <div className="text-zinc-400 text-[13px]">{p.circonscription ?? "—"}</div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEditParquet(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-[13px] font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
                        >
                          <Pencil className={btnIcon} />
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteParquet(p.id)}
                          disabled={deletingPId === p.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-2 text-[13px] font-medium text-red-400 hover:bg-red-500/15 disabled:opacity-50"
                        >
                          <Trash2 className={btnIcon} />
                          Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
