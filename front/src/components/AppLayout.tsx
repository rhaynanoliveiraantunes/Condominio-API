import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Home, History, Trophy, PlusCircle, ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Home; adminOnly?: boolean };

const navItems: NavItem[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/purchases/new", label: "Nova Compra", icon: PlusCircle, adminOnly: true },
  { to: "/history", label: "Histórico", icon: History },
  { to: "/ranking", label: "Ranking", icon: Trophy },
  { to: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  const items = navItems.filter((i) => !i.adminOnly || user?.role === "admin");

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/login" });
  };

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-[#1E293B] text-slate-100 md:flex">
        <div className="flex h-16 items-center gap-2 px-5 border-b border-white/10">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500 font-bold text-white">C</div>
          <div>
            <p className="text-sm font-semibold leading-tight">CondomínioBuy</p>
            <p className="text-xs text-slate-400">Compras coletivas</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive(item.to)
                    ? "bg-emerald-500 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="mb-2 px-2">
            <p className="text-sm font-medium">{user?.name ?? "Morador"}</p>
            <p className="text-xs text-slate-400">
              {user?.apartment ? `Apto ${user?.apartment}` : user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 font-bold text-white">C</div>
          <span className="text-sm font-semibold text-slate-800">CondomínioBuy</span>
        </div>
        <button
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {menuOpen && (
        <div className="fixed inset-x-0 top-14 z-20 border-b border-slate-200 bg-white md:hidden">
          <nav className="flex flex-col p-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    isActive(item.to)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </nav>
        </div>
      )}

      <main className="pb-24 md:pb-8 md:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white md:hidden">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium",
                isActive(item.to) ? "text-emerald-600" : "text-slate-500",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function ProtectedLayout({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, token, ready } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  if (typeof window !== "undefined" && ready && !checked) {
    setChecked(true);
    if (!token) {
      router.navigate({ to: "/login" });
      return null;
    }
    if (user && user.active === false) {
      // Inactive user cannot use the app
      router.navigate({ to: "/login" });
      return null;
    }
    if (requireAdmin && user?.role !== "admin") {
      router.navigate({ to: "/" });
      return null;
    }
  }

  if (!ready || !token) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">
        Carregando...
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}