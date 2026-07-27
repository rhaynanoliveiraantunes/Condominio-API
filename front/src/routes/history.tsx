import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { History as HistoryIcon, ShoppingBag, DollarSign, Calendar, ArrowUpRight } from "lucide-react";
import { ProtectedLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { api, apiErrorMessage } from "@/lib/api";
import { formatBRL, formatDateTime } from "@/lib/format";

type PurchaseSnapshot = {
  _id: string;
  product: string;
  unitPrice: number;
  status: string;
  term: string;
  minimumQuantity?: number;
  currentQuantity?: number;
};

type Participation = {
  _id?: string;
  amount?: number;
  createdAt?: string;
  purchase?: PurchaseSnapshot;
  purchaseId?: PurchaseSnapshot | string;
};

function getPurchase(item: Participation): PurchaseSnapshot | undefined {
  const raw = item.purchase ?? item.purchaseId;
  if (!raw) return undefined;
  if (typeof raw === "string") {
    return undefined;
  }
  return raw;
}

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Meu histórico — CondomínioBuy" }] }),
  component: () => (
    <ProtectedLayout>
      <HistoryPage />
    </ProtectedLayout>
  ),
});

function HistoryPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", "history"],
    queryFn: async () => (await api.get<Participation[]>("/users/history")).data,
  });

  const items = (data ?? []).slice().sort((a, b) => {
    const da = new Date(a.createdAt ?? getPurchase(a)?.term ?? 0).getTime();
    const db = new Date(b.createdAt ?? getPurchase(b)?.term ?? 0).getTime();
    return db - da;
  });

  const totalSpent = items.reduce((sum, item) => {
    const p = getPurchase(item);
    if (!p) return sum;
    return sum + (item.amount ?? 1) * p.unitPrice;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-10">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Meu Histórico de <span className="gradient-text-emerald">Adesões</span>
            </h1>
            <p className="text-sm text-slate-300">
              Acompanhe todas as compras coletivas em que você participou no condomínio.
            </p>
          </div>

          {/* Quick summary stats */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 block">Total em Compras</span>
              <span className="text-2xl font-extrabold gradient-text-emerald">{formatBRL(totalSpent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 animate-pulse rounded-2xl border border-white/10 bg-slate-900/40 p-6" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300">
          {apiErrorMessage(error, "Não foi possível carregar seu histórico.")}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/30 p-12 text-center backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HistoryIcon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Nenhuma participação registrada</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
            Você ainda não aderiu a nenhuma compra coletiva. Navegue na página inicial para ver as oportunidades ativas!
          </p>
        </div>
      )}

      {/* Items Grid */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const purchase = getPurchase(item);
          const amount = item.amount ?? 1;
          const min = Math.max(1, purchase?.minimumQuantity ?? 1);
          const cur = purchase?.currentQuantity ?? 0;
          const pct = Math.min(100, Math.round((cur / min) * 100));

          return (
            <li key={item._id ?? purchase?._id ?? i}>
              {purchase ? (
                <Link
                  to="/purchases/$id"
                  params={{ id: purchase._id }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl glass-card p-6 h-full transition-all duration-300"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                        {purchase.product}
                      </h3>
                      <StatusBadge status={purchase.status} />
                    </div>

                    <div className="mt-4 space-y-2 border-t border-white/5 pt-4 text-xs text-slate-300">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Preço unitário:</span>
                        <span className="font-semibold text-slate-200">{formatBRL(purchase.unitPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Sua quantidade:</span>
                        <span className="font-bold text-white">{amount} un</span>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-300">Seu Total:</span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        {formatBRL(amount * purchase.unitPrice)}
                      </span>
                    </div>

                    {purchase.term && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>Prazo: {formatDateTime(purchase.term)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 border-t border-white/5 pt-4">
                    <div className="mb-1.5 flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">{cur} de {min} confirmados</span>
                      <span className="text-emerald-400">{pct}%</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-950 p-0.5 border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl glass-card p-6">
                  <h3 className="text-lg font-bold text-white">Compra Registrada</h3>
                  <p className="mt-2 text-sm text-slate-400">Quantidade: {amount}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
