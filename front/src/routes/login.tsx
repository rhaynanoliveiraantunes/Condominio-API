import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
        // Clear session so user can't proceed
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
          <h1 className="text-xl font-semibold text-slate-800">Entrar</h1>
          <p className="mt-1 text-sm text-slate-500">Acesse sua conta de morador.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@condominio.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Ainda não tem conta?{" "}
            <Link to="/register" className="font-medium text-emerald-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}