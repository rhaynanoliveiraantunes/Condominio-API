import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft, Users, Calendar, DollarSign, Plus, Minus, CheckCircle, AlertCircle, ShoppingBag } from "lucide-react";
import { ProtectedLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { api, apiErrorMessage } from "@/lib/api";
import { formatBRL, formatDateTime } from "@/lib/format";
import { useAuth, currentUserId } from "@/lib/auth";

type PurchaseDetail = {
  _id: string;
  product: string;
  description?: string;
  unitPrice: number;
  minimumQuantity: number;
  currentQuantity: number;
  term: string;
  status: string;
  createdBy?: string;
  participants?: Array<
    string | { _id?: string; user?: string; userId?: string }
  >;
};

export const Route = createFileRoute("/purchases/$id")({
  head: () => ({ meta: [{ title: "Detalhes da compra — CondomínioBuy" }] }),
  component: () => (
    <ProtectedLayout>
      <PurchaseDetailPage />
    </ProtectedLayout>
  ),
});

function PurchaseDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const uid = currentUserId(user);
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["purchase", id],
    queryFn: async () => (await api.get<PurchaseDetail>(`/purchases/${id}`)).data,
  });

  const participants = data?.participants ?? [];
  const alreadyIn = participants.some((p) => {
    if (typeof p === "string") return p === uid;
    return p?._id === uid || p?.user === uid || p?.userId === uid;
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["purchase", id] });
    qc.invalidateQueries({ queryKey: ["purchases", "active"] });
  };

  const join = async () => {
    setBusy(true);
    try {
      await api.post(
        `/purchases/${id}/join`,
        { amount: Number(amount) },
        { headers: { "Content-Type": "application/json" } },
      );
      toast.success("Participação confirmada com sucesso!");
      invalidate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível participar."));
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    setBusy(true);
    try {
      await api.delete(`/purchases/${id}/join`);
      toast.success("Participação cancelada.");
      invalidate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível cancelar a participação."));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl glass-panel p-12 text-center text-slate-400 flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        <p>Carregando detalhes da compra...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300 flex items-center gap-3">
        <AlertCircle className="h-6 w-6 shrink-0 text-rose-400" />
        <span>{apiErrorMessage(error, "Compra não encontrada ou indisponível.")}</span>
      </div>
    );
  }

  const min = Math.max(1, data.minimumQuantity || 1);
  const cur = data.currentQuantity ?? 0;
  const pct = Math.min(100, Math.round((cur / min) * 100));
  const isActive = data.status === "active";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.history.back()}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white backdrop-blur-md"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para compras
      </button>

      {/* Main Glass Detail Container */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-10">
        <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Title Header & Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {data.product}
            </h1>
            {data.description && (
              <p className="text-base text-slate-300 leading-relaxed max-w-2xl pt-1">
                {data.description}
              </p>
            )}
          </div>
          <div className="shrink-0">
            <StatusBadge status={data.status} className="text-sm px-3.5 py-1.5" />
          </div>
        </div>

        {/* Grid Stats Tiles */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <InfoTile
            icon={<DollarSign className="h-4 w-4 text-emerald-400" />}
            label="Valor Unitário"
            value={formatBRL(data.unitPrice)}
            highlight
          />
          <InfoTile
            icon={<Users className="h-4 w-4 text-cyan-400" />}
            label="Progresso da Meta"
            value={`${cur} de ${min} unidades`}
          />
          <InfoTile
            icon={<Calendar className="h-4 w-4 text-amber-400" />}
            label="Prazo Limite"
            value={formatDateTime(data.term)}
          />
        </div>

        {/* Progress Bar & Meter */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-emerald-400" />
              Meta de adesão coletiva
            </span>
            <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-emerald-300">
              {pct}% atingido
            </span>
          </div>

          <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-slate-950 p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-emerald-300 transition-all duration-700 shadow-[0_0_15px_rgba(52,211,153,0.6)]"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>{cur} confirmados até agora</span>
            <span>Mínimo necessário: {min}</span>
          </div>
        </div>

        {/* Action / Participation Section */}
        <div className="mt-8 border-t border-white/10 pt-8">
          {isActive ? (
            alreadyIn ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-4">
                <div className="flex items-center gap-3 text-emerald-300 font-semibold">
                  <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-base font-bold text-white">Você já está participando desta compra!</p>
                    <p className="text-xs text-emerald-300/80">Sua unidade está contabilizada na meta coletiva.</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto rounded-xl font-semibold bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                  disabled={busy}
                  onClick={leave}
                >
                  {busy ? "Processando..." : "Cancelar minha participação"}
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
                <h3 className="text-lg font-bold text-white">Confirmar adesão</h3>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Quantidade desejada
                    </label>
                    <div className="flex items-center rounded-xl border border-white/15 bg-slate-950 p-1">
                      <button
                        type="button"
                        onClick={() => setAmount((a) => Math.max(1, a - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        id="amount"
                        type="number"
                        min={1}
                        value={amount}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setAmount(Number.isNaN(v) || v < 1 ? 1 : v);
                        }}
                        className="w-16 bg-transparent text-center font-bold text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setAmount((a) => a + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-slate-400 block">Total estimado:</span>
                    <span className="text-2xl font-extrabold gradient-text-emerald">
                      {formatBRL(amount * data.unitPrice)}
                    </span>
                  </div>

                  <Button
                    className="w-full sm:w-auto h-12 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 px-8 text-base font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all"
                    disabled={busy || amount < 1}
                    onClick={join}
                  >
                    {busy ? "Confirmando..." : "Quero Participar Agora"}
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
              Esta compra coletiva não está mais aceitando novas adesões.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {icon} {label}
      </div>
      <div className={`mt-2 font-extrabold ${highlight ? "text-2xl gradient-text-emerald" : "text-xl text-white"}`}>
        {value}
      </div>
    </div>
  );
}