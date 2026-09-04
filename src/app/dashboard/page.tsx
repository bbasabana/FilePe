import Image from "next/image";
import Link from "next/link";
import { FileText, UserCheck, UserX, Truck, Settings, ArrowUpRight } from "lucide-react";

const primaryModules = [
  {
    href: "/dashboard/prevenus",
    label: "Prévenus",
    description: "Enregistrer et suivre les dossiers des prévenus.",
    icon: UserCheck,
  },
  {
    href: "/dashboard/detenus",
    label: "Détenus",
    description: "Consulter et gérer les dossiers des personnes détenues.",
    icon: UserX,
  },
];

const secondaryModules = [
  {
    href: "/dashboard/dossiers",
    label: "Tous les dossiers",
    description: "Liste complète, recherche et fiches.",
    icon: FileText,
  },
  {
    href: "/dashboard/vehicules",
    label: "Véhicules",
    description: "Flotte et sorties planifiées.",
    icon: Truck,
  },
  {
    href: "/dashboard/referentiels",
    label: "Référentiels",
    description: "Juridictions et parquets.",
    icon: Settings,
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl animate-fade-in">
      {/* Identité */}
      <section
        className="relative overflow-hidden rounded-[1.25rem] mb-9 text-white"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 100% 0%, rgba(250,204,21,0.16), transparent 50%), linear-gradient(145deg, #0b1f4a 0%, #123a7a 50%, #0c4a6e 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h2v2H0V0zm4 4h2v2H4V4z'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 px-6 py-7 sm:flex-row sm:items-center sm:gap-8 sm:px-9 sm:py-9">
          <div className="flex h-[96px] w-[96px] shrink-0 items-center justify-center rounded-2xl bg-black/25 ring-1 ring-white/10 sm:h-[108px] sm:w-[108px]">
            <Image
              src="/images/armoirie.png"
              alt=""
              width={96}
              height={96}
              className="h-[80px] w-[80px] object-contain sm:h-[92px] sm:w-[92px]"
              priority
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300/90">
              République Démocratique du Congo
            </p>
            <h1 className="mt-2 max-w-lg text-[1.4rem] font-semibold leading-[1.25] tracking-tight sm:text-[1.65rem]">
              Ministère de la Justice
              <span className="block font-medium text-sky-100/95">
                et Garde des Sceaux
              </span>
            </h1>
            <div className="mt-4 h-px max-w-[12rem] bg-gradient-to-r from-amber-400/50 to-transparent" />
            <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-sky-100/80 sm:text-[14px]">
              Gestion des dossiers des prévenus et détenus de la{" "}
              <span className="text-white/95">Prison centrale de Makala</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Accès rapide */}
      <section>
        <header className="mb-5">
          <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">
            Accès rapide
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Choisissez un module pour commencer
          </p>
        </header>

        {/* Modules principaux */}
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          {primaryModules.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 transition hover:border-[#0b1f4a]/20 hover:shadow-[0_12px_40px_-16px_rgba(11,31,74,0.25)]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b1f4a] text-amber-300 transition group-hover:bg-[#123a7a]">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[15px] font-semibold text-slate-900">{label}</h3>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-[#0b1f4a]" />
                </div>
                <p className="mt-1 text-[13px] leading-snug text-slate-500">{description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Modules secondaires */}
        <div className="grid gap-3 sm:grid-cols-3">
          {secondaryModules.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-4 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-amber-50 group-hover:text-amber-700">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-slate-500" />
              </div>
              <h3 className="text-[14px] font-semibold text-slate-900">{label}</h3>
              <p className="mt-1 text-[12.5px] leading-snug text-slate-500">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
