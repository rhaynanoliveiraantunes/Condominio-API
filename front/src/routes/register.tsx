import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, User, Home, Mail, Lock, ArrowRight, ShieldCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, apiErrorMessage } from "@/lib/api";
import type { CondoItem } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Cadastro — CondomínioBuy" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", apartamento: "", email: "", senha: "", condoId: "" });
  const [condos, setCondos] = useState<CondoItem[]>([]);
  const [loadingCondos, setLoadingCondos] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCondos() {
      try {
        const { data } = await api.get<CondoItem[]>("/condos");
        setCondos(data ?? []);
        if (data && data.length > 0) {
          setForm((f) => ({ ...f, condoId: data[0]._id }));
        }
      } catch {
        /* noop */
      } finally {
        setLoadingCondos(false);
      }
    }
    fetchCondos();
  }, []);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.condoId) {
      toast.error("Por favor, selecione o seu condomínio.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.nome,
        apartment: form.apartamento,
        email: form.email,
        password: form.senha,
        condoId: form.condoId,
      };
      await api.post("/auth/register", payload);
      toast.success("Cadastro enviado! Aguarde a aprovação do síndico do seu condomínio para acessar.");
      router.navigate({ to: "/login" });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível concluir o cadastro."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden my-6">
      {/* Background Glows */}
      <div className="absolute top-1/3 right-1/2 translate-x-1/2 h-[450px] w-[450px] rounded-full bg-teal-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 font-extrabold text-slate-950 shadow-xl shadow-emerald-500/25">
            <Sparkles className="h-7 w-7 text-slate-950" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Condomínio<span className="gradient-text-emerald">Buy</span>
            </h1>
            <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
              Solicitação de Cadastro de Morador
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-10 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Criar sua conta</h2>
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Sua conta será liberada após validação do síndico.</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Condomínio Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="condominio" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                Seu Condomínio *
              </Label>
              {loadingCondos ? (
                <div className="h-12 rounded-xl glass-input px-3.5 py-3 text-xs text-slate-400 flex items-center">
                  Carregando condomínios...
                </div>
              ) : (
                <Select
                  value={form.condoId}
                  onValueChange={(val) => setForm((f) => ({ ...f, condoId: val }))}
                >
                  <SelectTrigger className="h-12 w-full rounded-xl glass-input text-slate-100 border border-white/12">
                    <SelectValue placeholder="Selecione seu condomínio" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border border-white/10 text-slate-200">
                    {condos.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name} — {c.address}
                      </SelectItem>
                    ))}
                    {condos.length === 0 && (
                      <SelectItem value="none" disabled>
                        Nenhum condomínio cadastrado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Nome completo
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="nome"
                  required
                  value={form.nome}
                  onChange={upd("nome")}
                  placeholder="Seu nome completo"
                  className="pl-10 h-12 rounded-xl glass-input text-sm text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apartamento" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Apartamento / Bloco
              </Label>
              <div className="relative">
                <Home className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="apartamento"
                  required
                  value={form.apartamento}
                  onChange={upd("apartamento")}
                  placeholder="Ex: Apt 204 Bloco B"
                  className="pl-10 h-12 rounded-xl glass-input text-sm text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                E-mail de acesso
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={upd("email")}
                  placeholder="voce@condominio.com"
                  className="pl-10 h-12 rounded-xl glass-input text-sm text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Senha de acesso
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="senha"
                  type="password"
                  required
                  minLength={6}
                  value={form.senha}
                  onChange={upd("senha")}
                  placeholder="Mínimo 6 caracteres"
                  className="pl-10 h-12 rounded-xl glass-input text-sm text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading || !form.condoId}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Enviando solicitação..." : "Enviar Solicitação de Cadastro"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="border-t border-white/10 pt-4 text-center">
            <p className="text-xs text-slate-400">
              Já possui uma conta ativa?{" "}
              <Link to="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}