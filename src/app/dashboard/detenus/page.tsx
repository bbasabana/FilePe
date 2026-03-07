"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Search, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

interface DetenuRow {
  id: string;
  numeroDossier: string;
  dateEntree: string;
  prevention: string | null;
  observation: string | null;
  nom: string | null;
  prenom: string | null;
}

export default function DetenusPage() {
  const router = useRouter();
  const [list, setList] = useState<DetenuRow[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
    fetch(`/api/dossiers?${params}`, { credentials: "include" })
      .then((res) => {
        if (res.status === 401) router.replace("/login");
        return res.json();
      })
      .then((data: { list?: DetenuRow[]; total?: number }) => {
        if (data?.list) setList(data.list);
        if (typeof data?.total === "number") setTotal(data.total);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [q, page, router]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-4xl w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">
            Détenus
          </h1>
          <p className="text-zinc-400 mt-1 text-[14px]">
            Identifier un détenu et enregistrer son dossier. Liste, recherche et fiche.
          </p>
        </div>
        <Link
          href="/dashboard/dossiers/nouveau"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dim transition shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          Créer un dossier détenu
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="search"
            placeholder="Rechercher par nom, prénom ou n° dossier..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQ(searchInput.trim())}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] pl-10 pr-4 py-2.5 text-[14px] text-white placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="button"
          onClick={() => setQ(searchInput.trim())}
          className="rounded-lg border border-white/[0.12] px-4 py-2.5 text-[13px] font-medium text-zinc-300 hover:bg-white/5"
        >
          Rechercher
        </button>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="loader-dot h-2 w-2 rounded-full bg-primary"
                  aria-hidden
                />
              ))}
            </div>
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-zinc-400">
            Aucun détenu enregistré.{" "}
            <Link href="/dashboard/dossiers/nouveau" className="text-primary hover:underline">
              Créer un dossier détenu
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-3 text-[12px] font-medium text-zinc-400">Nom</th>
                    <th className="px-4 py-3 text-[12px] font-medium text-zinc-400">Prénom</th>
                    <th className="px-4 py-3 text-[12px] font-medium text-zinc-400">N° dossier</th>
                    <th className="px-4 py-3 text-[12px] font-medium text-zinc-400">Date d&apos;entrée</th>
                    <th className="w-8 px-2 py-3" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/[0.06] hover:bg-white/[0.03] transition"
                    >
                      <td className="px-4 py-3 text-[14px] text-white">
                        {row.nom ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[14px] text-white">
                        {row.prenom ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[14px] text-white font-mono">
                        {row.numeroDossier}
                      </td>
                      <td className="px-4 py-3 text-[14px] text-zinc-400">
                        {row.dateEntree}
                      </td>
                      <td className="px-2 py-3">
                        <Link
                          href={`/dashboard/dossiers/${row.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:bg-white/5 hover:text-white"
                          aria-label="Voir la fiche détenu"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-white/[0.06]">
                <span className="text-[13px] text-zinc-400">
                  {total} détenu{total !== 1 ? "s" : ""}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-white/[0.1] px-3 py-1.5 text-[13px] text-zinc-400 hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Préc.
                  </button>
                  <span className="flex items-center px-3 py-1.5 text-[13px] text-zinc-400">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-white/[0.1] px-3 py-1.5 text-[13px] text-zinc-400 hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Suiv.
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
