import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Flame, Package } from "lucide-react";
import { ProtectedLayout } from "@/components/AppLayout";
import { api, apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

type RankingItem = {
  product: string;
  totalOrders: number;
};

export const Route = createFileRoute("/ranking")({
  head: () => ({ meta: [{ title: "Ranking — CondomínioBuy" }] }),
  component: () => (
    <ProtectedLayout>
      <RankingPage />
    </ProtectedLayout>
  ),
});

function RankingPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["rankings"],
    queryFn: async () => (await api.get<RankingItem[]>("/purchases/ranking")).data,
  });

  const items = (data ?? []).filter(
    (item): item is RankingItem =>
      Boolean(item) && typeof item.product === "string" && item.product.trim() !== "",
  );
  const max = Math.max(1, ...items.map((item) => item.totalOrders));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-10">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-lg shadow-amber-500/25">
            <Trophy className="h-9 w-9 text-slate-950" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-0.5 text-xs font-semibold text-amber-300 mb-1">
              <Flame className="h-3.5 w-3.5 text-amber-400" /> Mais Desejados do Condomínio
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Ranking de <span className="gradient-text-gold">Produtos</span>
            </h1>
            <p className="text-sm text-slate-300">
              Produtos e serviços com maior volume histórico de adesões entre os moradores.
            </p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-slate-900/40 p-4" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300">
          {apiErrorMessage(error, "Não foi possível carregar o ranking.")}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/30 p-12 text-center backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Nenhum dado de ranking ainda</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
            Assim que os moradores começarem a aderir às compras coletivas, os produtos mais populares aparecerão aqui!
          </p>
        </div>
      )}

      {/* Leaderboard List */}
      <ol className="space-y-4">
        {items.map((item, i) => {
          const pct = Math.round((item.totalOrders / max) * 100);
          const rank = i + 1;
          const isGold = rank === 1;
          const isSilver = rank === 2;
          const isBronze = rank === 3;

          return (
            <li
              key={i}
              className={cn(
                "relative overflow-hidden rounded-2xl glass-card p-5 sm:p-6 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                isGold && "border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-slate-900/80",
                isSilver && "border-slate-300/30 shadow-[0_0_20px_rgba(203,213,225,0.1)]",
                isBronze && "border-amber-700/30 shadow-[0_0_20px_rgba(180,83,9,0.1)]",
              )}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Rank Badge */}
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-extrabold text-base border shadow-md",
                    isGold
                      ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 border-amber-300 shadow-amber-500/30"
                      : isSilver
                        ? "bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-950 border-slate-200 shadow-slate-400/30"
                        : isBronze
                          ? "bg-gradient-to-tr from-amber-700 to-amber-500 text-slate-950 border-amber-500 shadow-amber-700/30"
                          : "bg-slate-900 text-slate-400 border-white/10",
                  )}
                >
                  {isGold ? <Trophy className="h-6 w-6" /> : isSilver || isBronze ? <Medal className="h-6 w-6" /> : `#${rank}`}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white truncate">{item.product}</span>
                    {isGold && (
                      <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                        #1 Campeão
                      </span>
                    )}
                  </div>

                  {/* Meter Bar */}
                  <div className="flex items-center gap-3">
                    <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-950 p-0.5 border border-white/5">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          isGold
                            ? "bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_10px_#f59e0b]"
                            : "bg-gradient-to-r from-teal-500 to-emerald-400",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 w-12 text-right">{pct}%</span>
                  </div>
                </div>
              </div>

              {/* Total Orders Badge */}
              <div className="flex items-center gap-2 shrink-0 rounded-xl bg-slate-950/80 border border-white/10 px-4 py-2.5">
                <Package className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-extrabold text-white">{item.totalOrders}</span>
                <span className="text-xs text-slate-400">pedidos</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}