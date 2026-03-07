"use client";

/** En-tête avec logo (drapeau) + texte "Prison de la prévention" pour PDF et écrans. */
export default function LogoHeader() {
  return (
    <div className="flex items-center gap-4">
      <div
        className="h-14 w-20 shrink-0 rounded border border-white/20 bg-gradient-to-b from-[#007fff] via [#007fff] to-[#f7d116]"
        style={{
          background: "linear-gradient(to bottom, #007fff 0% 33%, #ce1126 33% 66%, #f7d116 66% 100%)",
        }}
        aria-hidden
      />
      <div>
        <p className="text-lg font-bold text-white tracking-tight">Prison de la prévention</p>
        <p className="text-xs text-zinc-400">République Démocratique du Congo</p>
      </div>
    </div>
  );
}
