import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  QrCode,
  Copy,
  Clock,
  Ban,
  RefreshCw,
  Check,
} from "lucide-react";
import { ProtectedLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, apiErrorMessage } from "@/lib/api";
import { formatBRL, formatDateTime } from "@/lib/format";
import { useAuth, currentUserId, isSyndic, isSuperAdmin } from "@/lib/auth";
import { getProductImageUrl, handleProductImageError } from "@/lib/images";

type ParticipationItem = {
  _id: string;
  purchaseId: string;
  userId: {
    _id: string;
    name: string;
    apartment: string;
    email: string;
  };
  amount: number;
  paid: boolean;
  paymentStatus: "PENDING_PIX" | "PAID_VERIFYING" | "CONFIRMED" | "REFUND_PENDING" | "REFUNDED";
  receiptDetails?: string;
  userPixKey?: string;
  createdAt: string;
};

type PurchaseDetail = {
  _id: string;
  product: string;
  description?: string;
  unitPrice: number;
  minimumQuantity: number;
  currentQuantity: number;
  term: string;
  status: string;
  syndicPixKey?: string;
  createdBy?: string;
  myParticipation?: ParticipationItem;
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
  const canManage = isSyndic(user) || isSuperAdmin(user);

  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState(1);
  const [receiptDetails, setReceiptDetails] = useState("");
  const [userPixKey, setUserPixKey] = useState("");
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["purchase", id],
    queryFn: async () => (await api.get<PurchaseDetail>(`/purchases/${id}`)).data,
  });

  const { data: participantsData, isLoading: loadingParticipants } = useQuery({
    queryKey: ["purchase", id, "participants"],
    queryFn: async () => (await api.get<ParticipationItem[]>(`/purchases/${id}/participants`)).data,
    enabled: canManage,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["purchase", id] });
    qc.invalidateQueries({ queryKey: ["purchase", id, "participants"] });
    qc.invalidateQueries({ queryKey: ["purchases", "active"] });
  };

  const myPart = data?.myParticipation;

  const participate = async () => {
    setBusy(true);
    try {
      await api.post(`/purchases/${id}/participate`, { amount: Number(amount) });
      toast.success("Participação registrada! Realize o pagamento via PIX.");
      invalidate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível registrar a participação."));
    } finally {
      setBusy(false);
    }
  };

  const markPaid = async () => {
    if (!myPart?._id) return;
    setBusy(true);
    try {
      await api.patch(`/participations/${myPart._id}/pay`, {
        receiptDetails: receiptDetails.trim(),
        userPixKey: userPixKey.trim(),
      });
      toast.success("Aviso de pagamento enviado! Aguardando verificação do síndico.");
      invalidate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível informar o pagamento."));
    } finally {
      setBusy(false);
    }
  };

  const confirmPix = async (partId: string) => {
    setBusy(true);
    try {
      await api.patch(`/participations/${partId}/confirm`);
      toast.success("Pagamento PIX confirmado com sucesso!");
      invalidate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível confirmar o pagamento."));
    } finally {
      setBusy(false);
    }
  };

  const cancelPurchase = async () => {
    if (!window.confirm("Deseja realmente cancelar esta compra coletiva? Participações pagas serão movidas para Reembolso Pendente.")) return;
    setBusy(true);
    try {
      await api.patch(`/purchases/${id}/cancel`);
      toast.success("Compra cancelada. Participações movidas para Reembolso Pendente.");
      invalidate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível cancelar a compra."));
    } finally {
      setBusy(false);
    }
  };

  const confirmRefund = async (partId: string) => {
    setBusy(true);
    try {
      await api.patch(`/participations/${partId}/refund`);
      toast.success("Reembolso marcado como concluído!");
      invalidate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível atualizar o reembolso."));
    } finally {
      setBusy(false);
    }
  };

  const copyPixKey = (key?: string) => {
    if (!key) return;
    navigator.clipboard.writeText(key);
    setCopied(true);
    toast.success("Chave PIX copiada para a área de transferência!");
    setTimeout(() => setCopied(false), 2500);
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
  const isOpen = data.status === "OPEN" || data.status === "active" || data.status === "MINIMUM_REACHED";
  const isCancelled = data.status === "CANCELLED" || data.status === "cancelled";
  const syndicPix = data.syndicPixKey || "sindico@condominiobuy.com.br";

  const participantsList = participantsData ?? [];
  const pendingRefunds = participantsList.filter((p) => p.paymentStatus === "REFUND_PENDING");

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

        {/* Title Header & Status with Image Thumbnail */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-6">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl">
              <img
                src={getProductImageUrl(data.product)}
                alt={data.product}
                onError={handleProductImageError}
                className="h-full w-full object-cover"
              />
            </div>
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
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <StatusBadge status={data.status} className="text-sm px-3.5 py-1.5" />
            {canManage && !isCancelled && (
              <Button
                variant="destructive"
                size="sm"
                disabled={busy}
                onClick={cancelPurchase}
                className="rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold flex items-center gap-1.5"
              >
                <Ban className="h-3.5 w-3.5" /> Cancelar Compra
              </Button>
            )}
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

        {/* RESIDENT CHECKOUT & PIX SECTION */}
        <div className="mt-8 border-t border-white/10 pt-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-400" /> Pagamento e Adesão via PIX
          </h2>

          {isOpen ? (
            !myPart ? (
              /* Step 1: Select quantity & create participation */
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
                <h3 className="text-base font-bold text-white">1. Selecione a quantidade</h3>
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
                    <span className="text-xs text-slate-400 block">Total a pagar:</span>
                    <span className="text-2xl font-extrabold gradient-text-emerald">
                      {formatBRL(amount * data.unitPrice)}
                    </span>
                  </div>

                  <Button
                    className="w-full sm:w-auto h-12 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 px-8 text-base font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all"
                    disabled={busy || amount < 1}
                    onClick={participate}
                  >
                    {busy ? "Gerando PIX..." : "Gerar Dados do PIX"}
                  </Button>
                </div>
              </div>
            ) : (
              /* Step 2: PIX Key display & Pay confirmation */
              <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">Sua Adesão</h3>
                      <StatusBadge status={myPart.paymentStatus} />
                    </div>
                    <p className="text-xs text-slate-300">
                      Quantidade: <span className="font-bold text-white">{myPart.amount} un</span> | Total:{" "}
                      <span className="font-bold text-emerald-400">{formatBRL(myPart.amount * data.unitPrice)}</span>
                    </p>
                  </div>
                </div>

                {/* PIX Key Box */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-emerald-300 flex items-center gap-1.5">
                      <QrCode className="h-4 w-4 text-emerald-400" /> Chave PIX do Síndico
                    </span>
                    <Button
                      size="sm"
                      onClick={() => copyPixKey(syndicPix)}
                      className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold gap-1.5"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copiado!" : "Copiar Chave PIX"}
                    </Button>
                  </div>
                  <div className="font-mono text-sm font-bold text-white bg-slate-950/80 p-3 rounded-lg border border-white/10 select-all break-all">
                    {syndicPix}
                  </div>
                </div>

                {/* Pay Form if PENDING_PIX */}
                {myPart.paymentStatus === "PENDING_PIX" && (
                  <div className="space-y-4 border-t border-white/10 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="receipt" className="text-xs uppercase font-semibold text-slate-300">
                        Comprovante / ID da Transação (opcional)
                      </Label>
                      <Input
                        id="receipt"
                        value={receiptDetails}
                        onChange={(e) => setReceiptDetails(e.target.value)}
                        placeholder="Ex: ID 123456789 ou link do comprovante"
                        className="h-11 rounded-xl glass-input text-sm text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userPix" className="text-xs uppercase font-semibold text-slate-300">
                        Sua Chave PIX (para eventuais reembolsos)
                      </Label>
                      <Input
                        id="userPix"
                        value={userPixKey}
                        onChange={(e) => setUserPixKey(e.target.value)}
                        placeholder="Ex: Seu CPF, E-mail ou Telefone"
                        className="h-11 rounded-xl glass-input text-sm text-white"
                      />
                    </div>

                    <Button
                      onClick={markPaid}
                      disabled={busy}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25"
                    >
                      {busy ? "Confirmando..." : "Já fiz o PIX (Notificar Síndico)"}
                    </Button>
                  </div>
                )}

                {myPart.paymentStatus === "PAID_VERIFYING" && (
                  <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-xs text-sky-300 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-sky-400 shrink-0" />
                    <span>Pagamento informado! O síndico conferirá o valor e confirmará sua vaga na compra.</span>
                  </div>
                )}

                {myPart.paymentStatus === "CONFIRMED" && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span>Pagamento verificado e confirmado pelo síndico! Você está garantido na compra coletiva.</span>
                  </div>
                )}

                {myPart.paymentStatus === "REFUND_PENDING" && (
                  <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-xs text-orange-300 flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-orange-400 shrink-0 animate-spin" />
                    <div>
                      <p className="font-bold text-white text-sm">Reembolso em Processamento</p>
                      <p className="mt-0.5">
                        Esta compra foi cancelada. O síndico realizará a devolução do seu PIX em breve.
                      </p>
                    </div>
                  </div>
                )}

                {myPart.paymentStatus === "REFUNDED" && (
                  <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-xs text-purple-300 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0" />
                    <span>Reembolso concluído com sucesso pelo síndico!</span>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
              Esta compra coletiva não está mais aceitando novas adesões.
            </div>
          )}
        </div>

        {/* SYNDIC / SUPER ADMIN: PARTICIPANTS TABLE & REFUNDS SECTION */}
        {canManage && (
          <div className="mt-10 border-t border-white/10 pt-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-emerald-400" /> Tabela de Participantes & Validação de PIX
              </h2>

              <div className="overflow-hidden rounded-3xl glass-panel border border-white/10">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-900/90 border-b border-white/10">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400 py-4">Morador</TableHead>
                        <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Apto</TableHead>
                        <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Qtd</TableHead>
                        <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Total (R$)</TableHead>
                        <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Status do PIX</TableHead>
                        <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400 text-right pr-6">Ação do Síndico</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participantsList.map((p) => (
                        <TableRow key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="font-bold text-white py-4">
                            {p.userId?.name ?? "Morador"}
                            {p.receiptDetails && (
                              <span className="block text-[11px] font-normal text-slate-400">
                                Comprovante: {p.receiptDetails}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-300 font-semibold">{p.userId?.apartment ?? "-"}</TableCell>
                          <TableCell className="text-slate-200 font-bold">{p.amount}</TableCell>
                          <TableCell className="text-emerald-400 font-extrabold">
                            {formatBRL(p.amount * data.unitPrice)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={p.paymentStatus} />
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            {p.paymentStatus === "PAID_VERIFYING" && (
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => confirmPix(p._id)}
                                className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold"
                              >
                                Aprovar PIX
                              </Button>
                            )}
                            {p.paymentStatus === "REFUND_PENDING" && (
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => confirmRefund(p._id)}
                                className="rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 hover:bg-orange-500/30 text-xs font-bold"
                              >
                                Confirmar Reembolso
                              </Button>
                            )}
                            {p.paymentStatus === "CONFIRMED" && (
                              <span className="text-xs font-semibold text-emerald-400">Verificado ✓</span>
                            )}
                            {p.paymentStatus === "REFUNDED" && (
                              <span className="text-xs font-semibold text-purple-400">Devolvido ✓</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {participantsList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                            Nenhuma participação registrada nesta compra até o momento.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* PENDING REFUNDS SECTION */}
            {pendingRefunds.length > 0 && (
              <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-orange-400" /> Reembolsos Pendentes ({pendingRefunds.length})
                </h3>
                <p className="text-xs text-orange-300">
                  Devolva o valor aos moradores abaixo e clique em "Confirmar Reembolso" para atualizar o status.
                </p>

                <div className="space-y-3">
                  {pendingRefunds.map((pr) => (
                    <div key={pr._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-950 p-4 border border-white/10">
                      <div>
                        <p className="font-bold text-white text-sm">{pr.userId?.name} (Apto {pr.userId?.apartment})</p>
                        <p className="text-xs text-slate-400">
                          Valor a Devolver: <span className="font-bold text-emerald-400">{formatBRL(pr.amount * data.unitPrice)}</span>
                          {pr.userPixKey && (
                            <span className="block text-slate-300 font-mono mt-0.5">
                              Chave PIX do Morador: {pr.userPixKey}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => confirmRefund(pr._id)}
                        className="rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 hover:bg-orange-500/30 text-xs font-bold"
                      >
                        Confirmar Reembolso
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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