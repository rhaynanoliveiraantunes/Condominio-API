import { Link } from "@tanstack/react-router";
import { Clock, Users, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "./StatusBadge";
import { formatBRL, formatDateTime } from "@/lib/format";
import { getProductImageUrl, handleProductImageError } from "@/lib/images";

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
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl glass-card p-6 transition-all duration-300 hover:border-emerald-500/40"
    >
      {/* Decorative top accent glow */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl transition-all duration-500 group-hover:bg-emerald-500/20" />

      <div>
        {/* Header: Dynamic Image Thumbnail + Title + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-md">
              <img
                src={getProductImageUrl(purchase.product)}
                alt={purchase.product}
                onError={handleProductImageError}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold tracking-tight text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                {purchase.product}
              </h3>
              {purchase.description && (
                <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {purchase.description}
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={purchase.status} />
        </div>

        {/* Price & Deadline Section */}
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2 border-t border-white/5 pt-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">
              Valor unitário
            </span>
            <span className="text-2xl font-extrabold gradient-text-emerald">
              {formatBRL(purchase.unitPrice)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/60 border border-white/5 px-2.5 py-1.5 text-xs text-slate-300">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>{formatDateTime(purchase.term)}</span>
          </div>
        </div>
      </div>

      {/* Progress & Meter Section */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1 text-slate-300">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            {cur} de {min} confirmados
          </span>
          <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-300 font-bold">
            {pct}%
          </span>
        </div>

        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-950/80 p-0.5 border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-emerald-300 transition-all duration-500 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-end text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
          <span>Ver detalhes e participar</span>
          <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}