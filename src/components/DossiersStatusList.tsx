"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Search, ChevronRight, UserCheck, UserX, type LucideIcon } from "lucide-react";

const PAGE_SIZE = 20;

interface Row {
  numeroDossier: string;
  dateEntree: string;
  nom: string | null;
  prenom: string | null;
}

type StatusKind = "prevenu" | "detenu";

const config: Record<
  StatusKind,
  {
    title: string;
    subtitle: string;
    createHref: string;
    createLabel: string;
    emptyLabel: string;
    countLabel: (n: number) => string;
    icon: LucideIcon;
    accent: string;
  }
> = {
  prevenu: {
    title: "Prévenus",
    subtitle: "Liste, recherche et fiches des dossiers prévenus.",
    createHref: "/dashboard/dossiers/nouveau?type=prevenu",
    createLabel: "Nouveau prévenu",
    emptyLabel: "Aucun prévenu enregistré",
    countLabel: (n) => `${n} prévenu${n !== 1 ? "s" : ""}`,
    icon: UserCheck,
    accent: "from-sky-500/15 to-transparent",
  },
  detenu: {
    title: "Détenus",
    subtitle: "Liste, recherche et fiches des dossiers détenus.",
    createHref: "/dashboard/dossiers/nouveau?type=detenu",
    createLabel: "Nouveau détenu",
    emptyLabel: "Aucun détenu enregistré",
    countLabel: (n) => `${n} détenu${n !== 1 ? "s" : ""}`,
    icon: UserX,
    accent: "from-amber-400/20 to-transparent",
  },
};

function formatDate(value: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DossiersStatusList({ status }: { status: StatusKind }) {
  const cfg = config[status];
  const Icon = cfg.icon;
  const router = useRouter();
  const [list, setList] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("status", status);
    if (q) params.set("q", q);
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
    fetch(`/api/dossiers?${params}`, { credentials: "include" })
      .then((res) => {
        if (res.status === 401) router.replace("/login");
        return res.json();
      })
      .then((data: { list?: Row[]; total?: number }) => {
        if (data?.list) setList(data.list);
        if (typeof data?.total === "number") setTotal(data.total);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [q, page, router, status]);

  function runSearch() {
    setPage(1);
    setQ(searchInput.trim());
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto w-full max-w-5xl animate-fade-in">
      {/* En-tête */}
      <div
        className="relative mb-6 overflow-hidden rounded-2xl px-5 py-5 sm:px-7 sm:py-6 text-white"
        style={{
          background:
            "linear-gradient(135deg, #0b1f4a 0%, #123a7a 55%, #0c4a6e 100%)",
        }}
      >
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l ${cfg.accent}`}
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5 min-w-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Icon className="h-5 w-5 text-amber-300" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <h1 className="text-[1.35rem] font-semibold tracking-tight">{cfg.title}</h1>
              <p className="mt-1 text-[13px] text-sky-100/75">{cfg.subtitle}</p>
            </div>
          </div>
          <Link
            href={cfg.createHref}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-[13px] font-semibold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
          >
            <UserPlus className="h-4 w-4" strokeWidth={2} />
            {cfg.createLabel}
          </Link>
        </div>
      </div>

      {/* Recherche */}
      <div className="mb-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Nom, prénom ou n° de dossier…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#123a7a]/40 focus:ring-2 focus:ring-[#123a7a]/10"
          />
        </div>
        <button
          type="button"
          onClick={runSearch}
          className="rounded-xl bg-[#0b1f4a] px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#123a7a]"
        >
          Rechercher
        </button>
      </div>

      {/* Liste */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/40">
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Icon className="h-5 w-5" />
            </span>
            <p className="text-[14px] font-medium text-slate-700">{cfg.emptyLabel}</p>
            <p className="mt-1 text-[13px] text-slate-500">
              Commencez par créer un nouveau dossier.
            </p>
            <Link
              href={cfg.createHref}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0b1f4a] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#123a7a]"
            >
              <UserPlus className="h-4 w-4" />
              {cfg.createLabel}
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Identité
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      N° dossier
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Entrée
                    </th>
                    <th className="w-12 px-3 py-3" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr
                      key={row.numeroDossier}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-[14px] font-medium text-slate-900">
                          {[row.nom, row.prenom].filter(Boolean).join(" ") || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[12px] text-slate-700">
                          {row.numeroDossier}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-500">
                        {formatDate(row.dateEntree)}
                      </td>
                      <td className="px-3 py-3.5">
                        <Link
                          href={`/dashboard/dossiers/${encodeURIComponent(row.numeroDossier)}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#0b1f4a]/5 hover:text-[#0b1f4a]"
                          aria-label="Voir la fiche"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-slate-100 sm:hidden">
              {list.map((row) => (
                <li key={row.numeroDossier}>
                  <Link
                    href={`/dashboard/dossiers/${encodeURIComponent(row.numeroDossier)}`}
                    className="flex items-center gap-3 px-4 py-3.5 transition active:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-slate-900">
                        {[row.nom, row.prenom].filter(Boolean).join(" ") || "—"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                        {row.numeroDossier} · {formatDate(row.dateEntree)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-5">
              <span className="text-[12px] text-slate-500">{cfg.countLabel(total)}</span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
                  >
                    Préc.
                  </button>
                  <span className="min-w-[3.5rem] text-center text-[12px] text-slate-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
                  >
                    Suiv.
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
