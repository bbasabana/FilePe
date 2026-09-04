"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import {
  LayoutDashboard,
  FileText,
  UserCheck,
  UserX,
  Settings,
  LogOut,
  Menu,
  X,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const menuItems: MenuItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/prevenus", label: "Prévenus", icon: UserCheck },
  { href: "/dashboard/detenus", label: "Détenus", icon: UserX },
  { href: "/dashboard/dossiers", label: "Tous les dossiers", icon: FileText },
  { href: "/dashboard/vehicules", label: "Planification véhicules", icon: Truck },
  { href: "/dashboard/referentiels", label: "Référentiels", icon: Settings },
  { href: "/dashboard/utilisateurs", label: "Utilisateurs", icon: Users, adminOnly: true },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium tracking-tight transition-colors ${
        active
          ? "bg-gradient-to-r from-amber-400/20 to-amber-400/5 text-amber-200"
          : "text-sky-100/70 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
          active
            ? "bg-amber-400/20 text-amber-300"
            : "bg-white/[0.04] text-sky-200/60 group-hover:bg-white/[0.08] group-hover:text-sky-100"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="truncate">{label}</span>
      {active && (
        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden />
      )}
    </Link>
  );
}

function BrandHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-start gap-3 px-4 pt-5 pb-4">
      <Image
        src="/images/armoirie.png"
        alt="Armoiries RDC"
        width={48}
        height={48}
        className="h-12 w-12 object-contain shrink-0"
        priority
      />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[13px] font-semibold text-white leading-snug">
          Ministère de la Justice
        </p>
        <p className="mt-0.5 text-[11px] text-sky-200/65 leading-snug">
          et Garde des Sceaux
        </p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-sky-100/60 hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function SidebarNav({
  userRole,
  pathname,
  onNavigate,
}: {
  userRole?: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const visible = menuItems.filter((item) => !item.adminOnly || userRole === "admin");

  return (
    <nav className="flex-1 overflow-y-auto px-3 pb-2">
      <div className="space-y-0.5">
        {visible.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActivePath(pathname, item.href)}
            onClick={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}

function SoftAccountFooter({
  email,
  role,
  onRequestLogout,
}: {
  email: string;
  role: string;
  onRequestLogout: () => void;
}) {
  const initial = (email?.[0] ?? "?").toUpperCase();

  return (
    <div className="mx-3 mb-3 mt-auto rounded-2xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-inset ring-white/[0.06]">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/25 to-sky-400/15 text-[13px] font-semibold text-amber-200/90 ring-1 ring-white/10"
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium text-white/85 leading-tight">
            {email}
          </p>
          <p className="mt-0.5 text-[10px] tracking-wide text-sky-200/45">
            {role === "admin" ? "Administrateur" : role}
          </p>
        </div>
        <button
          type="button"
          onClick={onRequestLogout}
          title="Se déconnecter"
          aria-label="Se déconnecter"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sky-100/40 transition hover:bg-white/[0.07] hover:text-amber-200/90"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function LogoutConfirmModal({
  open,
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#0b1f4a]/55 backdrop-blur-[3px]"
        aria-label="Fermer"
        onClick={onCancel}
        disabled={loading}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        className="relative w-full max-w-[360px] rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-900/20 animate-slide-up"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <LogOut className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h2 id="logout-title" className="text-center text-[16px] font-semibold text-slate-900">
          Se déconnecter ?
        </h2>
        <p className="mt-2 text-center text-[13px] leading-relaxed text-slate-500">
          Vous allez quitter votre session. Vous pourrez vous reconnecter à tout moment.
        </p>
        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-[#0b1f4a] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#123a7a] disabled:opacity-50"
          >
            {loading ? "Déconnexion…" : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, hydrate } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    hydrate().then((ok) => {
      setChecking(false);
      if (!ok) router.replace("/login");
    });
  }, [mounted, hydrate, router]);

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      logout();
      toast.success("Déconnexion réussie");
      router.replace("/login");
    } finally {
      setLogoutLoading(false);
      setLogoutOpen(false);
    }
  }

  if (!mounted || checking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1f4a]">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="loader-dot h-2 w-2 rounded-full bg-amber-400" aria-hidden />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:w-[260px] md:flex-col md:fixed md:inset-y-0 text-white"
        style={{
          background:
            "linear-gradient(180deg, #0b1f4a 0%, #0e2a5c 48%, #0c3d66 100%)",
        }}
      >
        <BrandHeader />
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <div className="mt-4 flex flex-1 flex-col min-h-0">
          <SidebarNav userRole={user.role} pathname={pathname} />
          <SoftAccountFooter
            email={user.email}
            role={user.role}
            onRequestLogout={() => setLogoutOpen(true)}
          />
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:pl-[260px] min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 md:px-7">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="md:hidden -ml-1 rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="md:hidden flex items-center gap-2 min-w-0">
            <Image
              src="/images/armoirie.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span className="truncate text-[13px] font-semibold text-slate-900">
              Justice · Makala
            </span>
          </div>
          <div className="hidden md:block text-[13px] text-slate-500">
            <span className="font-medium text-slate-800">Prison centrale de Makala</span>
            <span className="mx-2 text-slate-300">·</span>
            <span>Kinshasa</span>
          </div>
          <div className="flex-1" />
          <span className="hidden sm:inline max-w-[160px] truncate text-[12px] text-slate-500">
            {user.email}
          </span>
          <span className="rounded-lg bg-[#0b1f4a]/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0b1f4a]">
            {user.role}
          </span>
        </header>

        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-[#0b1f4a]/50 backdrop-blur-[2px] md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
            <aside
              className="fixed top-0 left-0 z-40 flex h-full w-[280px] flex-col text-white animate-slide-up md:hidden"
              style={{
                background:
                  "linear-gradient(180deg, #0b1f4a 0%, #0e2a5c 48%, #0c3d66 100%)",
              }}
            >
              <BrandHeader onClose={() => setSidebarOpen(false)} />
              <div className="mx-4 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
              <div className="mt-4 flex flex-1 flex-col min-h-0">
                <SidebarNav
                  userRole={user.role}
                  pathname={pathname}
                  onNavigate={() => setSidebarOpen(false)}
                />
                <SoftAccountFooter
                  email={user.email}
                  role={user.role}
                  onRequestLogout={() => {
                    setSidebarOpen(false);
                    setLogoutOpen(true);
                  }}
                />
              </div>
            </aside>
          </>
        )}

        <LogoutConfirmModal
          open={logoutOpen}
          loading={logoutLoading}
          onCancel={() => !logoutLoading && setLogoutOpen(false)}
          onConfirm={handleLogout}
        />

        <main className="flex-1 overflow-auto p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
