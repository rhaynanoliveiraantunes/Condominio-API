import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PackagePlus, Sparkles, DollarSign, Hash, Calendar, FileText, QrCode } from "lucide-react";
import { ProtectedLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, apiErrorMessage } from "@/lib/api";
import { toDatetimeLocalMin } from "@/lib/format";

export const Route = createFileRoute("/purchases/new")({
  head: () => ({ meta: [{ title: "Nova compra — CondomínioBuy" }] }),
  component: () => (
    <ProtectedLayout requireAdmin>
      <NewPurchase />
    </ProtectedLayout>
  ),
});

function NewPurchase() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    product: "",
    description: "",
    unitPrice: "",
    minimumQuantity: "",
    term: "",
    syndicPixKey: "",
  });

  const minDate = toDatetimeLocalMin();

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prazoDate = new Date(form.term);
    if (Number.isNaN(prazoDate.getTime()) || prazoDate.getTime() <= Date.now()) {
      toast.error("O prazo precisa ser uma data futura.");
      return;
    }
    const valor = Number(form.unitPrice);
    const qtd = Number(form.minimumQuantity);
    if (!(valor > 0) || !(qtd > 0)) {
      toast.error("Informe um valor e quantidade mínima válidos.");
      return;
    }
    if (!form.syndicPixKey.trim()) {
      toast.error("Informe a Chave PIX para recebimento.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/purchases", {
        product: form.product,
        description: form.description,
        unitPrice: valor,
        minimumQuantity: qtd,
        term: prazoDate.toISOString(),
        syndicPixKey: form.syndicPixKey.trim(),
      });
      toast.success("Compra coletiva criada com sucesso!");
      router.navigate({ to: "/" });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar a compra."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/25">
            <PackagePlus className="h-7 w-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-xs font-semibold text-emerald-300 mb-1">
              <Sparkles className="h-3 w-3 text-emerald-400" /> Painel de Síndico
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Propor Nova Compra Coletiva
            </h1>
            <p className="text-sm text-slate-300">
              Cadastre produtos para que os moradores possam aderir e garantir preços reduzidos.
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form
        onSubmit={onSubmit}
        className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-10 space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="product" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <PackagePlus className="h-4 w-4 text-emerald-400" />
            Nome do Produto / Serviço *
          </Label>
          <Input
            id="product"
            required
            value={form.product}
            onChange={set("product")}
            placeholder="Ex: Sacos de Ração Premium 15kg, Gás de Cozinha, Pintura de Garagem..."
            className="h-12 rounded-xl glass-input text-base text-white placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            Descrição e Especificações
          </Label>
          <Textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={set("description")}
            placeholder="Descreva detalhes do fornecedor, marca, condições de entrega ou observações relevantes..."
            className="rounded-xl glass-input text-sm text-white placeholder:text-slate-500 resize-none p-3.5"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="valor" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Valor Unitário (R$) *
            </Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.unitPrice}
              onChange={set("unitPrice")}
              placeholder="0,00"
              className="h-12 rounded-xl glass-input text-base font-bold text-emerald-300 placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qtd" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Hash className="h-4 w-4 text-cyan-400" />
              Quantidade Mínima de Pedidos *
            </Label>
            <Input
              id="qtd"
              type="number"
              min="1"
              required
              value={form.minimumQuantity}
              onChange={set("minimumQuantity")}
              placeholder="Ex: 10"
              className="h-12 rounded-xl glass-input text-base text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="syndicPixKey" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-emerald-400" />
            Chave PIX do Síndico (para Recebimentos) *
          </Label>
          <Input
            id="syndicPixKey"
            required
            value={form.syndicPixKey}
            onChange={set("syndicPixKey")}
            placeholder="Ex: 11999998888, sindico@condominiobuy.com ou chave aleatória"
            className="h-12 rounded-xl glass-input text-base text-white placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="term" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-400" />
            Prazo Limite para Adesão *
          </Label>
          <Input
            id="term"
            type="datetime-local"
            required
            min={minDate}
            value={form.term}
            onChange={set("term")}
            className="h-12 rounded-xl glass-input text-base text-white [color-scheme:dark]"
          />
        </div>

        <div className="pt-4 border-t border-white/10">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-base font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] transition-all"
          >
            {loading ? "Publicando Compra..." : "Publicar Compra Coletiva"}
          </Button>
        </div>
      </form>
    </div>
  );
}