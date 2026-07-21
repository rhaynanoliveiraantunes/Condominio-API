import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { History as HistoryIcon } from "lucide-react";
import { ProtectedLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
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
    // purchaseId may be a string when the backend hasn't populated it.
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

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Meu histórico</h1>
        <p className="text-sm text-slate-500">Compras em que você participou.</p>
      </header>

      {isLoading && (
        <div className="rounded-xl bg-white p-8 text-center text-slate-500">Carregando...</div>
      )}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {apiErrorMessage(error, "Não foi possível carregar seu histórico.")}
        </div>
      )}
      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <HistoryIcon className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-700">Você ainda não participou de compras.</p>
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-800 line-clamp-2">
                      {purchase.product}
                    </h3>
                    <StatusBadge status={purchase.status} />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-emerald-600">
                      {formatBRL(purchase.unitPrice)}
                    </span>
                    <span className="text-slate-500">Quantidade: {amount}</span>
                  </div>

                 
                  <div className="mt-3 border-t border-slate-100 pt-3 flex items-center justify-between">
                    <span className="font-medium text-slate-600">Total a pagar:</span>
                    <span className="text-lg font-bold text-emerald-700">
                      {formatBRL(amount * purchase.unitPrice)}
                    </span>
                  </div>
                

                  {purchase.term && (
                    <div className="mt-2 text-xs text-slate-500">
                      Prazo: {formatDateTime(purchase.term)}
                    </div>
                  )}

                  <div className="mt-3">
                    <Progress value={pct} className="h-2" />
                    <div className="mt-1 flex justify-between text-xs text-slate-500">
                      <span>
                        {cur} / {min} confirmados
                      </span>
                      <span>{pct}%</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-800">Compra</h3>
                  </div>
                  <div className="mt-4 text-sm text-slate-500">
                    Quantidade: {amount}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
