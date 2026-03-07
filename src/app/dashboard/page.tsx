import Link from "next/link";
import { FileText, UserCheck, UserX, Truck, Settings } from "lucide-react";

const cards = [
  { href: "/dashboard/prevenus", label: "Prévenus", description: "Dossiers des prévenus", icon: UserCheck },
  { href: "/dashboard/detenus", label: "Détenus", description: "Dossiers des détenus", icon: UserX },
  { href: "/dashboard/dossiers", label: "Tous les dossiers", description: "Liste complète et recherche", icon: FileText },
  { href: "/dashboard/vehicules", label: "Planification véhicules", description: "Flotte et sorties planifiées", icon: Truck },
  { href: "/dashboard/referentiels", label: "Référentiels", description: "Juridictions et parquets", icon: Settings },
];

export default function DashboardPage() {
  return (
    <div className="max-w-3xl w-full animate-fade-in">
      <div className="mb-10">
        <h1 className="text-[22px] font-semibold text-white tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-zinc-400 mt-1 text-[14px]">
          Prison de Makala · Kinshasa
        </p>
      </div>

      <section>
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-4">
          Accès rapide
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.05]"
            >
              <div className="rounded-lg bg-white/10 p-2.5 text-white/90 group-hover:bg-white/15">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-white text-[15px]">{label}</h3>
                <p className="text-[13px] text-zinc-400 mt-0.5">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
