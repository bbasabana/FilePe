"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

const SIZE = { default: 180, compact: 64 } as const;

export default function QrDossier({ numero, compact = false }: { numero: string; compact?: boolean }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const px = compact ? SIZE.compact : SIZE.default;

  useEffect(() => {
    if (!numero || typeof window === "undefined") return;
    const url = `${window.location.origin}/scan/${encodeURIComponent(numero)}`;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(url, { width: px * 2, margin: 1 }).then(setDataUrl).catch(() => setDataUrl(null));
    });
  }, [numero, px]);

  if (!dataUrl) return null;

  if (compact) {
    return (
      <div className="shrink-0 flex items-center gap-2 rounded-lg border border-slate-200 bg-white pl-2 pr-2.5 py-1.5 shadow-sm" title={`Scan dossier ${numero}`}>
        <img src={dataUrl} alt={`QR ${numero}`} className="rounded w-[52px] h-[52px]" width={52} height={52} />
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider hidden sm:inline">QR</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 inline-flex flex-col items-center">
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">Scan dossier</p>
      <img src={dataUrl} alt={`QR dossier ${numero}`} className="rounded-lg w-[180px] h-[180px]" />
      <p className="text-[10px] text-slate-500 mt-2 font-mono">{numero}</p>
    </div>
  );
}
