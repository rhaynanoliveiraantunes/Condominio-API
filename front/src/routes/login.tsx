import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { apiErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — CondomínioBuy" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, token, ready } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && token) router.navigate({ to: "/" });
  }, [ready, token, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, senha);
      if (user.active === false) {
        toast.warning("Sua conta aguarda aprovação do síndico.");
        window.localStorage.removeItem("cb_token");
        window.localStorage.removeItem("cb_user");
        window.location.reload();
        return;
      }
      toast.success(`Bem-vindo(a), ${user.name ?? "morador"}!`);
      router.navigate({ to: "/" });
    } catch (err) {
      const msg = apiErrorMessage(err, "Não foi possível entrar.");
      if (msg.toLowerCase().includes("aprova") || msg.toLowerCase().includes("inativ")) {
        toast.warning("Sua conta aguarda aprovação do síndico.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 font-extrabold text-slate-950 shadow-xl shadow-emerald-500/25">
            <Sparkles className="h-7 w-7 text-slate-950" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Condomínio<span className="gradient-text-emerald">Buy</span>
            </h1>
            <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
              Compras Coletivas Inteligentes
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-10 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Acesse sua conta</h2>
            <p className="text-xs text-slate-400">
              Digite suas credenciais de morador para entrar na plataforma.
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@condominio.com"
                  className="pl-10 h-12 rounded-xl glass-input text-sm text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="senha"
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12 rounded-xl glass-input text-sm text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Entrando..." : "Entrar na plataforma"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="border-t border-white/10 pt-4 text-center">
            <p className="text-xs text-slate-400">
              Ainda não possui uma conta?{" "}
              <Link to="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                Cadastrar-se como morador
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}