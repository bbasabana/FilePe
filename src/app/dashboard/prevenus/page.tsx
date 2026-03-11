"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Search, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

interface Row {
  id: string;
  numeroDossier: string;
  dateEntree: string;
  prevention: string | null;
  observation: string | null;
  nom: string | null;
  prenom: string | null;
}

export default function PrevenusPage() {
  const router = useRouter();
  const [list, setList] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", "prevenu");
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
  }, [q, page, router]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-4xl w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">
            Prévenus
          </h1>
          <p className="text-slate-500 mt-1 text-[14px]">
            Dossiers des prévenus. Liste, recherche et fiche.
          </p>
        </div>
        <Link
          href="/dashboard/dossiers/nouveau?type=prevenu"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dim transition shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          Créer un dossier prévenu
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher par nom, prénom ou n° dossier..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQ(searchInput.trim())}
            className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="button"
          onClick={() => setQ(searchInput.trim())}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
        >
          Rechercher
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-white animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-slate-500">
            Aucun prévenu enregistré.{" "}
            <Link href="/dashboard/dossiers/nouveau?type=prevenu" className="text-primary hover:underline">
              Créer un dossier prévenu
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-[12px] font-medium text-slate-500">Nom</th>
                    <th className="px-4 py-3 text-[12px] font-medium text-slate-500">Prénom</th>
                    <th className="px-4 py-3 text-[12px] font-medium text-slate-500">N° dossier</th>
                    <th className="px-4 py-3 text-[12px] font-medium text-slate-500">Date d&apos;entrée</th>
                    <th className="w-8 px-2 py-3" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition"
                    >
                      <td className="px-4 py-3 text-[14px] text-slate-900">{row.nom ?? "—"}</td>
                      <td className="px-4 py-3 text-[14px] text-slate-900">{row.prenom ?? "—"}</td>
                      <td className="px-4 py-3 text-[14px] text-slate-900 font-mono">{row.numeroDossier}</td>
                      <td className="px-4 py-3 text-[14px] text-slate-500">{row.dateEntree}</td>
                      <td className="px-2 py-3">
                        <Link
                          href={`/dashboard/dossiers/${encodeURIComponent(row.numeroDossier)}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                          aria-label="Voir la fiche"
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
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-slate-200">
                <span className="text-[13px] text-slate-500">
                  {total} prévenu{total !== 1 ? "s" : ""}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-[13px] text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Préc.
                  </button>
                  <span className="flex items-center px-3 py-1.5 text-[13px] text-slate-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-[13px] text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
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
