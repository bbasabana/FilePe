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

interface UserRow {
  id: string;
  email: string;
  role: string;
  blocked: boolean;
  createdAt: string;
}

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
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (currentUser?.role !== "admin") {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <p className="text-slate-500 text-sm">Accès réservé aux administrateurs.</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-primary text-sm hover:underline"
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
      setList((prev) => [...prev, { id: data.id, email: data.email, role: data.role, blocked: false, createdAt: new Date().toISOString() }]);
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
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE", credentials: "include" });
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
    <div className="max-w-4xl w-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-primary" />
          Utilisateurs
        </h1>
        <p className="text-slate-500 mt-1 text-[14px]">
          Ajouter des utilisateurs, gérer les rôles, bloquer ou modifier les mots de passe.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
        <h2 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </h2>
        <form onSubmit={addUser} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px]">
            <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="utilisateur@exemple.cd"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="min-w-[160px]">
            <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Mot de passe * (min. 6)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="min-w-[120px]">
            <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "juriste")}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="juriste">Juriste</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider">Liste des utilisateurs</h2>
        </div>
        {list.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Aucun utilisateur.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-[12px] font-medium text-slate-500">Email</th>
                  <th className="px-4 py-3 text-[12px] font-medium text-slate-500">Rôle</th>
                  <th className="px-4 py-3 text-[12px] font-medium text-slate-500">État</th>
                  <th className="px-4 py-3 text-[12px] font-medium text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900 flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-slate-400 shrink-0" />
                      {u.email}
                      {u.id === currentUser?.id && (
                        <span className="text-[10px] text-slate-400">(vous)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value as "admin" | "juriste")}
                        disabled={u.id === currentUser?.id}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 focus:border-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="juriste">Juriste</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {u.blocked ? (
                        <span className="text-red-400 text-[12px] font-medium">Bloqué</span>
                      ) : (
                        <span className="text-emerald-500/90 text-[12px]">Actif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleBlock(u)}
                          disabled={u.id === currentUser?.id}
                          title={u.blocked ? "Débloquer" : "Bloquer"}
                          className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none"
                        >
                          {u.blocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPasswordUserId(u.id); setNewPassword(""); }}
                          title="Modifier le mot de passe"
                          className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUser(u)}
                          disabled={u.id === currentUser?.id}
                          title="Supprimer"
                          className="p-2 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40 disabled:pointer-events-none"
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
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => { setPasswordUserId(null); setNewPassword(""); }} aria-hidden />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-300 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-slate-900">Modifier le mot de passe</h3>
              <button type="button" onClick={() => { setPasswordUserId(null); setNewPassword(""); }} className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe (min. 6 caractères)"
              minLength={6}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => { setPasswordUserId(null); setNewPassword(""); }} className="rounded-lg border border-slate-300 px-4 py-2 text-[13px] text-slate-500 hover:bg-slate-50">
                Annuler
              </button>
              <button type="button" onClick={saveNewPassword} disabled={passwordSaving || newPassword.trim().length < 6} className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50">
                {passwordSaving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
