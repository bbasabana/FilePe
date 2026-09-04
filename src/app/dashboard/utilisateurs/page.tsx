"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import {
  Users as UsersIcon,
  Plus,
  Lock,
  Unlock,
  Key,
  Trash2,
  X,
  UserCircle,
} from "lucide-react";
import PageHero from "@/components/PageHero";

interface UserRow {
  id: string;
  email: string;
  role: string;
  blocked: boolean;
  createdAt: string;
}

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#123a7a]/40 focus:ring-2 focus:ring-[#123a7a]/10";
const labelClass = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400";

export default function UtilisateursPage() {
  const router = useRouter();
  const { user: currentUser, hydrate } = useAuthStore();
  const [list, setList] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "juriste">("juriste");
  const [submitting, setSubmitting] = useState(false);

  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    hydrate().then((ok) => {
      if (!ok) router.replace("/login");
    });
  }, [mounted, hydrate, router]);

  useEffect(() => {
    if (!mounted || currentUser?.role !== "admin") {
      setLoading(false);
      return;
    }
    fetch("/api/users", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) router.replace("/login");
        if (res.status === 403) return [];
        return res.ok ? res.json() : [];
      })
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [mounted, currentUser?.role, router]);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="loader-dot h-2 w-2 rounded-full bg-amber-400" aria-hidden />
          ))}
        </div>
      </div>
    );
  }

  if (currentUser?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="text-sm text-slate-500">Accès réservé aux administrateurs.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-sm font-medium text-[#0b1f4a] hover:underline"
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    const e1 = email.trim().toLowerCase();
    const p1 = password.trim();
    if (!e1 || !p1) {
      toast.error("Email et mot de passe requis");
      return;
    }
    if (p1.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: e1, password: p1, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      setList((prev) => [
        ...prev,
        {
          id: data.id,
          email: data.email,
          role: data.role,
          blocked: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      setEmail("");
      setPassword("");
      toast.success("Utilisateur créé");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleBlock(u: UserRow) {
    if (u.id === currentUser?.id) {
      toast.error("Vous ne pouvez pas bloquer votre propre compte");
      return;
    }
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ blocked: !u.blocked }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Erreur");
        return;
      }
      setList((prev) => prev.map((x) => (x.id === u.id ? { ...x, blocked: !x.blocked } : x)));
      toast.success(u.blocked ? "Utilisateur débloqué" : "Utilisateur bloqué");
    } catch {
      toast.error("Erreur réseau");
    }
  }

  async function saveNewPassword() {
    if (!passwordUserId || !newPassword.trim() || newPassword.trim().length < 6) {
      toast.error("Mot de passe d’au moins 6 caractères requis");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch(`/api/users/${passwordUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: newPassword.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Erreur");
        return;
      }
      setPasswordUserId(null);
      setNewPassword("");
      toast.success("Mot de passe modifié");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function changeRole(u: UserRow, newRole: "admin" | "juriste") {
    if (u.role === newRole) return;
    if (u.id === currentUser?.id && newRole === "juriste") {
      toast.error("Vous ne pouvez pas passer votre propre compte en Juriste.");
      return;
    }
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Erreur");
        return;
      }
      setList((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
      toast.success("Rôle mis à jour");
    } catch {
      toast.error("Erreur réseau");
    }
  }

  async function deleteUser(u: UserRow) {
    if (u.id === currentUser?.id) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte");
      return;
    }
    if (!confirm(`Supprimer l'utilisateur ${u.email} ? Cette action est irréversible.`)) return;
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Erreur");
        return;
      }
      setList((prev) => prev.filter((x) => x.id !== u.id));
      toast.success("Utilisateur supprimé");
    } catch {
      toast.error("Erreur réseau");
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl animate-fade-in">
      <PageHero
        title="Utilisateurs"
        subtitle="Comptes, rôles, blocage et mots de passe."
        icon={UsersIcon}
        accent="from-amber-400/20 to-transparent"
      />

      <section className="mb-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Plus className="h-4 w-4" />
          </span>
          Nouvel utilisateur
        </h2>
        <form onSubmit={addUser} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="utilisateur@exemple.cd"
              className={fieldClass}
            />
          </div>
          <div className="min-w-[160px]">
            <label className={labelClass}>Mot de passe * (min. 6)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className={fieldClass}
            />
          </div>
          <div className="min-w-[130px]">
            <label className={labelClass}>Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "juriste")}
              className={fieldClass}
            >
              <option value="juriste">Juriste</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition hover:bg-amber-300 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/40">
        <div className="border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-[15px] font-semibold text-slate-900">
            Liste des utilisateurs
            <span className="ml-2 text-[12px] font-normal text-slate-400">
              ({list.length})
            </span>
          </h2>
        </div>
        {list.length === 0 ? (
          <div className="px-6 py-12 text-center text-[14px] text-slate-500">
            Aucun utilisateur.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Email
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Rôle
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    État
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0b1f4a]/8 text-[#0b1f4a]">
                          <UserCircle className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium text-slate-900">
                            {u.email}
                          </p>
                          {u.id === currentUser?.id && (
                            <p className="text-[11px] text-slate-400">Vous</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value as "admin" | "juriste")}
                        disabled={u.id === currentUser?.id}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] text-slate-800 outline-none focus:border-[#123a7a]/40 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="juriste">Juriste</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.blocked ? (
                        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-medium text-red-600">
                          Bloqué
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleBlock(u)}
                          disabled={u.id === currentUser?.id}
                          title={u.blocked ? "Débloquer" : "Bloquer"}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-40"
                        >
                          {u.blocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordUserId(u.id);
                            setNewPassword("");
                          }}
                          title="Modifier le mot de passe"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUser(u)}
                          disabled={u.id === currentUser?.id}
                          title="Supprimer"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {passwordUserId && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[#0b1f4a]/45 backdrop-blur-[2px]"
            aria-label="Fermer"
            onClick={() => {
              setPasswordUserId(null);
              setNewPassword("");
            }}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/20 animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-slate-900">
                Modifier le mot de passe
              </h3>
              <button
                type="button"
                onClick={() => {
                  setPasswordUserId(null);
                  setNewPassword("");
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe (min. 6)"
              minLength={6}
              className={`${fieldClass} mb-4`}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPasswordUserId(null);
                  setNewPassword("");
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveNewPassword}
                disabled={passwordSaving || newPassword.trim().length < 6}
                className="rounded-xl bg-[#0b1f4a] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#123a7a] disabled:opacity-50"
              >
                {passwordSaving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
