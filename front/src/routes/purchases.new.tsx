import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ProtectedLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, apiErrorMessage } from "@/lib/api";
import { toDatetimeLocalMin } from "@/lib/format";

export const Route = createFileRoute("/purchases/new")({
  head: () => ({ meta: [{ title: "Nova compra — CondomínioBuy" }] }), // <-- Corrigido aqui
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
      toast.error("O prazo precisa ser uma data futura."); // <-- Corrigido aqui
      return;
    }
    const valor = Number(form.unitPrice);
    const qtd = Number(form.minimumQuantity);
    if (!(valor > 0) || !(qtd > 0)) {
      toast.error("Informe um valor e quantidade mínima válidos."); // <-- Corrigido aqui
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
      });
      toast.success("Compra criada com sucesso!");
      router.navigate({ to: "/" });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar a compra.")); // <-- Corrigido aqui
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Nova compra coletiva</h1> {/* <-- Corrigido aqui */}
        <p className="text-sm text-slate-500">
          Proponha um item para que os vizinhos possam aderir.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-1.5">
          <Label htmlFor="product">Produto</Label>
          <Input id="product" required value={form.product} onChange={set("product")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={set("description")}
            placeholder="Detalhes, especificações, fornecedor..."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="valor">Valor unitário (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.unitPrice}
              onChange={set("unitPrice")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qtd">Quantidade mínima</Label>
            <Input
              id="qtd"
              type="number"
              min="1"
              required
              value={form.minimumQuantity}
              onChange={set("minimumQuantity")}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="term">Prazo</Label>
          <Input
            id="term"
            type="datetime-local"
            required
            min={minDate}
            value={form.term}
            onChange={set("term")}
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600"
        >
          {loading ? "Salvando..." : "Criar compra"} {/* <-- Corrigido aqui */}
        </Button>
      </form>
    </div>
  );
}