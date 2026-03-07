"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
} from "lucide-react";

const menuItems: { href: string; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/prevenus", label: "Prévenus", icon: UserCheck },
  { href: "/dashboard/detenus", label: "Détenus", icon: UserX },
  { href: "/dashboard/dossiers", label: "Tous les dossiers", icon: FileText },
  { href: "/dashboard/vehicules", label: "Planification véhicules", icon: Truck },
  { href: "/dashboard/referentiels", label: "Référentiels", icon: Settings },
  { href: "/dashboard/utilisateurs", label: "Utilisateurs", icon: Users, adminOnly: true },
];

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
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    logout();
    toast.success("Déconnexion réussie");
    router.replace("/login");
  }

  if (!mounted || checking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
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
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar — desktop: fond discret, item actif avec barre gauche */}
      <aside className="hidden md:flex md:w-52 md:flex-col md:fixed md:inset-y-0 bg-[#111111] border-r border-white/[0.06]">
        <div className="px-4 h-14 flex items-center border-b border-white/[0.06]">
          <span className="font-semibold text-[15px] text-white">FilePe</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {menuItems.filter((item) => !item.adminOnly || user?.role === "admin").map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white border-l-2 border-primary pl-[11px]"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border-l-2 border-transparent"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile header + drawer */}
      <div className="flex-1 flex flex-col md:pl-52 min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-sm px-4 md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="md:hidden p-2 -ml-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white"
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="md:hidden font-semibold text-white">FilePe</span>
          <div className="flex-1" />
          <span className="text-[13px] text-zinc-400 truncate max-w-[160px]">
            {user.email}
          </span>
        </header>

        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/60 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
            <aside className="fixed top-0 left-0 z-40 w-64 h-full bg-[#111111] border-r border-white/[0.06] animate-slide-up md:hidden">
              <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.06]">
                <span className="font-semibold text-white">FilePe</span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-zinc-400 hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="py-4 px-3 space-y-0.5">
                {menuItems.filter((item) => !item.adminOnly || user?.role === "admin").map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                        isActive ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                >
                  <LogOut className="h-[18px] w-[18px] shrink-0" />
                  Déconnexion
                </button>
              </div>
            </aside>
          </>
        )}

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
