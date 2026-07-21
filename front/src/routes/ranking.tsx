import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { ProtectedLayout } from "@/components/AppLayout";
import { api, apiErrorMessage } from "@/lib/api";

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
      Boolean(item) && typeof item.product === "string" && item.product.trim() !== ""
  );
  const max = Math.max(1, ...items.map((item) => item.totalOrders));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Ranking de produtos</h1>
        <p className="text-sm text-slate-500">Itens com maior volume histórico de pedidos.</p>
      </header>

      {isLoading && (
        <div className="rounded-xl bg-white p-8 text-center text-slate-500">Carregando...</div>
      )}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {apiErrorMessage(error, "Não foi possível carregar o ranking.")}
        </div>
      )}
      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-700">Sem dados de ranking ainda.</p>
        </div>
      )}

      <ol className="space-y-3">
        {items.map((item, i) => {
          const pct = Math.round((item.totalOrders / max) * 100);
          return (
            <li key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-800">
                  #{i + 1} · {item.product}
                </span>
                <span className="text-slate-500">{item.totalOrders} pedidos</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}