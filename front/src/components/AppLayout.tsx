import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Home, History, Trophy, PlusCircle, ShieldCheck, LogOut, Menu, X, Sparkles, Building2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth, isSyndic, isSuperAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Home; adminOnly?: boolean };

const navItems: NavItem[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/purchases/new", label: "Nova Compra", icon: PlusCircle, adminOnly: true },
  { to: "/history", label: "Histórico", icon: History },
  { to: "/ranking", label: "Ranking", icon: Trophy },
  { to: "/admin", label: "Painel Admin", icon: ShieldCheck, adminOnly: true },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  const canAccessAdmin = isSyndic(user) || isSuperAdmin(user);
  const items = navItems.filter((i) => !i.adminOnly || canAccessAdmin);

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/login" });
  };

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const initials = (user?.name ?? "M")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleBadgeLabel = isSuperAdmin(user)
    ? "Super Admin"
    : isSyndic(user)
      ? "Síndico"
      : "Morador";

  return (
    <div className="min-h-screen text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col p-4 md:flex">
        <div className="flex h-full flex-col justify-between rounded-2xl glass-panel p-5 relative overflow-hidden">
          {/* Subtle background glow element */}
          <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div>
            {/* Logo Brand */}
            <div className="flex items-center gap-3.5 pb-6 border-b border-white/10">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20">
                <Sparkles className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight gradient-text-title block leading-tight">
                  Condomínio<span className="text-emerald-400 font-extrabold">Buy</span>
                </span>
                <span className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                  Compras Coletivas
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="mt-6 space-y-1.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "group relative flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                      active
                        ? "bg-emerald-500/15 text-emerald-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-emerald-500/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    )}
                    <Icon className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-110", active ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User profile section */}
          <div className="border-t border-white/10 pt-4 mt-auto">
            <div className="flex items-center gap-3 rounded-xl bg-slate-900/50 border border-white/5 p-3 mb-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-sm font-bold text-emerald-400 border border-emerald-500/20">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold text-slate-200">{user?.name ?? "Usuário"}</p>
                  <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                    {roleBadgeLabel}
                  </span>
                </div>
                <p className="truncate text-xs text-slate-400">
                  {user?.apartment ? `Apto ${user?.apartment}` : user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-500/20 hover:border-rose-500/30"
            >
              <LogOut className="h-4 w-4" /> Sair da conta
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 font-bold text-slate-950 shadow-md shadow-emerald-500/20">
            <Sparkles className="h-5 w-5 text-slate-950" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            Condomínio<span className="text-emerald-400">Buy</span>
          </span>
        </div>
        <button
          className="rounded-xl border border-white/10 bg-slate-900/60 p-2.5 text-slate-300 hover:bg-white/10"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile drawer menu */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-16 z-20 border-b border-white/10 bg-slate-950/95 p-4 backdrop-blur-2xl md:hidden animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                    active
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-white/5",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-emerald-400" : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300"
            >
              <LogOut className="h-5 w-5" /> Sair
            </button>
          </nav>
        </div>
      )}

      {/* Main Container */}
      <main className="pb-28 md:pb-12 md:pl-72">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-10">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl md:hidden">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                active ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_#34d399]")} />
              <span>{item.label}</span>
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
      router.navigate({ to: "/login" });
      return null;
    }
    if (requireAdmin && !isSyndic(user) && !isSuperAdmin(user)) {
      router.navigate({ to: "/" });
      return null;
    }
  }

  if (!ready || !token) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm font-medium">Carregando CondomínioBuy...</p>
        </div>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}