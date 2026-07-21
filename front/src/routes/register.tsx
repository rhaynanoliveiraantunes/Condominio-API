import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, apiErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Cadastro — CondomínioBuy" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", apartamento: "", email: "", senha: "" });
  const [loading, setLoading] = useState(false);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.nome,
        apartment: form.apartamento,
        email: form.email,
        password: form.senha,
      };
      await api.post("/auth/register", payload);
      toast.success("Cadastro enviado! Aguarde a aprovação do síndico para acessar.");
      router.navigate({ to: "/login" });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível concluir o cadastro."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 font-bold text-white">
            C
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">CondomínioBuy</p>
            <p className="text-xs text-slate-500">Compras coletivas</p>
          </div>
        </div>

        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">Criar conta</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sua conta será liberada após validação do síndico.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" required value={form.nome} onChange={upd("nome")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apartamento">Apartamento</Label>
              <Input
                id="apartamento"
                required
                value={form.apartamento}
                onChange={upd("apartamento")}
                placeholder="Ex: 204B"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={form.email} onChange={upd("email")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                required
                minLength={6}
                value={form.senha}
                onChange={upd("senha")}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? "Enviando..." : "Cadastrar"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Já tem conta?{" "}
            <Link to="/login" className="font-medium text-emerald-600 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}