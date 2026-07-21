import { Link } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "./StatusBadge";
import { formatBRL, formatDateTime } from "@/lib/format";

export type Purchase = {
  _id: string;
  product: string;
  description?: string;
  unitPrice: number;
  minimumQuantity: number;
  currentQuantity: number;
  term: string;
  status: string;
  createdBy?: string;
};

export function PurchaseCard({ purchase }: { purchase: Purchase }) {
  const min = Math.max(1, purchase.minimumQuantity || 1);
  const cur = purchase.currentQuantity ?? 0;
  const pct = Math.min(100, Math.round((cur / min) * 100));

  return (
    <Link
      to="/purchases/$id"
      params={{ id: purchase._id }}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{purchase.product}</h3>
          {purchase.description && (
            <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">{purchase.description}</p>
          )}
        </div>
        <StatusBadge status={purchase.status} />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-emerald-600">{formatBRL(purchase.unitPrice)}</span>
        <span className="text-slate-500">Prazo: {formatDateTime(purchase.term)}</span>
      </div>

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
  );
}