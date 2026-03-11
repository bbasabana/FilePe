"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Erreur de connexion";
        setError(msg);
        toast.error(msg);
        return;
      }
      setUser(data.user);
      toast.success("Connexion réussie");
      router.push("/dashboard");
    } catch {
      setError("Erreur de connexion");
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-surface">
      <div className="w-full max-w-[360px] animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-primary">
            FilePe
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            Prison de Makala · Kinshasa
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl bg-surface-elevated p-6 shadow-lg"
        >
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-ink-secondary mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink-primary placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="vous@exemple.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-ink-secondary mb-1.5"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink-primary placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-primary py-3 font-medium text-white transition hover:bg-primary-dim disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
