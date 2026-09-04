import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function PageHero({
  title,
  subtitle,
  icon: Icon,
  action,
  accent = "from-amber-400/15 to-transparent",
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  action?: ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="relative mb-6 overflow-hidden rounded-2xl px-5 py-5 sm:px-7 sm:py-6 text-white"
      style={{
        background: "linear-gradient(135deg, #0b1f4a 0%, #123a7a 55%, #0c4a6e 100%)",
      }}
    >
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l ${accent}`}
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5 min-w-0">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Icon className="h-5 w-5 text-amber-300" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h1 className="text-[1.35rem] font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-[13px] text-sky-100/75">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}
