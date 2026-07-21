import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft, Users, Calendar, DollarSign } from "lucide-react";
import { ProtectedLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  head: () => ({ meta: [{ title: "Detalhes da purchase — CondomínioBuy" }] }),
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
      toast.success("Participação confirmada!");
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
    return <div className="rounded-xl bg-white p-8 text-center text-slate-500">Carregando...</div>;
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {apiErrorMessage(error, "Compra não encontrada.")}
      </div>
    );
  }

  const min = Math.max(1, data.minimumQuantity || 1);
  const cur = data.currentQuantity ?? 0;
  const pct = Math.min(100, Math.round((cur / min) * 100));
  const isActive = data.status === "active";

  return (
    <div>
      <button
        onClick={() => router.history.back()}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{data.product}</h1>
            {data.description && <p className="mt-1 text-slate-600">{data.description}</p>}
          </div>
          <StatusBadge status={data.status} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <InfoTile icon={<DollarSign className="h-4 w-4" />} label="Valor unitário" value={formatBRL(data.unitPrice)} />
          <InfoTile icon={<Users className="h-4 w-4" />} label="Progresso" value={`${cur} / ${min}`} />
          <InfoTile icon={<Calendar className="h-4 w-4" />} label="Prazo" value={formatDateTime(data.term)} />
        </div>

        <div className="mt-6">
          <Progress value={pct} className="h-3" />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>{pct}% da meta atingida</span>
            <span>Mínimo: {min}</span>
          </div>
        </div>

        <div className="mt-8">
          {isActive ? (
            alreadyIn ? (
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={busy}
                onClick={leave}
              >
                {busy ? "Processando..." : "Cancelar participação"}
              </Button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-col gap-1">
                  <label htmlFor="amount" className="text-sm font-medium text-slate-700">
                    Quantidade
                  </label>
                  <input
                    id="amount"
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setAmount(Number.isNaN(v) || v < 1 ? 1 : v);
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 sm:w-auto"
                  disabled={busy || amount < 1}
                  onClick={join}
                >
                  {busy ? "Processando..." : "Participar"}
                </Button>
              </div>
            )
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Esta purchase não aceita mais adesões.
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon} {label}
      </div>
      <div className="mt-1 font-semibold text-slate-800">{value}</div>
    </div>
  );
}