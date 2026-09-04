"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Fraunces, DM_Sans } from "next/font/google";
import { useAuthStore } from "@/store/auth-store";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-login-display",
  weight: ["500", "600", "700"],
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-login-body",
  weight: ["400", "500", "600", "700"],
});

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
    <div
      className={`${display.variable} ${body.variable} relative min-h-screen overflow-hidden`}
      style={{ fontFamily: "var(--font-login-body), system-ui, sans-serif" }}
    >
      {/* Fond atmosphérique bleu RDC + accents jaune */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(250, 204, 21, 0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, rgba(56, 189, 248, 0.2), transparent 50%), linear-gradient(165deg, #0b1f4a 0%, #123a7a 42%, #0c4a6e 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl login-orb"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-sky-400/25 blur-3xl login-orb-delayed"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px] login-rise">
          {/* Marque : armoirie + ministère */}
          <header className="mb-8 text-center login-brand">
            <div className="mx-auto mb-4 flex h-[112px] w-[112px] items-center justify-center login-crest">
              <Image
                src="/images/armoirie.png"
                alt="Armoiries de la République Démocratique du Congo"
                width={112}
                height={112}
                priority
                className="h-[112px] w-[112px] object-contain"
              />
            </div>
            <h1
              className="text-[1.35rem] leading-snug font-semibold text-white sm:text-[1.5rem]"
              style={{ fontFamily: "var(--font-login-display), Georgia, serif" }}
            >
              Ministère de la Justice
              <br />
              et Garde des Sceaux
            </h1>
            <p className="mx-auto mt-3 max-w-[34ch] text-[13px] leading-relaxed text-sky-100/85">
              Gestion des dossiers des prévenus et détenus de la Prison centrale
              de Makala. Identité, documents et suivi réunis en un seul outil.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-md login-form"
          >
            {error && (
              <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">
                {error}
              </p>
            )}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-sky-100/80"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40"
                placeholder="vous@exemple.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-sky-100/80"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 py-3.5 text-[15px] font-semibold text-slate-900 shadow-lg shadow-amber-500/25 transition hover:brightness-105 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-sky-200/50">
            République Démocratique du Congo · Prison centrale de Makala
          </p>
        </div>
      </div>
    </div>
  );
}
