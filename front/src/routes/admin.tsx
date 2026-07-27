import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Users, ShoppingBag, Sparkles, UserCheck, Ban } from "lucide-react";
import { ProtectedLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import type { User } from "@/lib/auth";
import type { Purchase } from "@/components/PurchaseCard";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel administrativo — CondomínioBuy" }] }),
  component: () => (
    <ProtectedLayout requireAdmin>
      <AdminPage />
    </ProtectedLayout>
  ),
});

function AdminPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-10">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-500 to-emerald-600 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/25">
            <ShieldCheck className="h-9 w-9 text-slate-950" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-0.5 text-xs font-semibold text-emerald-300 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Acesso de Síndico / Gestor
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Painel <span className="gradient-text-emerald">Administrativo</span>
            </h1>
            <p className="text-sm text-slate-300">
              Gerencie a aprovação de moradores e administre o status das compras coletivas.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="h-13 rounded-2xl bg-slate-900/80 border border-white/10 p-1.5 backdrop-blur-md">
          <TabsTrigger
            value="users"
            className="rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/40 transition-all flex items-center gap-2"
          >
            <Users className="h-4 w-4" /> Gestão de Moradores
          </TabsTrigger>
          <TabsTrigger
            value="purchases"
            className="rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/40 transition-all flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" /> Gestão de Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="purchases">
          <PurchasesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsersTab() {
  const qc = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => (await api.get<User[]>("/users/admin")).data,
  });

  const toggle = async (u: User) => {
    const id = u._id ?? u.id;
    if (!id) return;
    setPending(id);
    try {
      await api.put(`/users/admin/${id}`, { active: !u.active });
      toast.success(u.active ? "Acesso do usuário desativado." : "Usuário aprovado e ativado!");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível atualizar o status do morador."));
    } finally {
      setPending(null);
    }
  };

  if (isLoading)
    return (
      <div className="rounded-3xl glass-panel p-8 text-center text-slate-400">
        Carregando lista de moradores...
      </div>
    );
  if (isError)
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300">
        {apiErrorMessage(error)}
      </div>
    );

  const users = data ?? [];

  return (
    <div className="overflow-hidden rounded-3xl glass-panel border border-white/10">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-900/90 border-b border-white/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400 py-4">Nome</TableHead>
              <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400">E-mail</TableHead>
              <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Apartamento</TableHead>
              <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Perfil</TableHead>
              <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400 text-right pr-6">Status / Ativar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const id = u._id ?? u.id ?? "";
              const isActive = !!u.active;
              return (
                <TableRow key={id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-bold text-white py-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      {(u.name ?? "M")[0].toUpperCase()}
                    </div>
                    {u.name ?? "-"}
                  </TableCell>
                  <TableCell className="text-slate-300 font-medium">{u.email ?? "-"}</TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-md bg-slate-900 border border-white/10 px-2.5 py-1 text-xs font-bold text-slate-200">
                      Apto {u.apartment ?? "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${u.role === "admin" ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" : "bg-slate-500/10 text-slate-300 border-slate-500/30"}`}>
                      {u.role ?? "user"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-3">
                      <span className={`text-xs font-bold ${isActive ? "text-emerald-400" : "text-amber-400"}`}>
                        {isActive ? "Ativo" : "Pendente"}
                      </span>
                      <Switch
                        checked={isActive}
                        disabled={pending === id}
                        onCheckedChange={() => toggle(u)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                  Nenhum morador cadastrado até o momento.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function PurchasesTab() {
  const qc = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "purchases"],
    queryFn: async () => (await api.get<Purchase[]>("/purchases")).data,
  });

  const cancel = async (id: string) => {
    if (!window.confirm("Deseja realmente cancelar esta compra coletiva? O registro será mantido com status cancelado.")) return;
    setPending(id);
    try {
      await api.patch(`/purchases/${id}/cancel`);
      toast.success("Compra cancelada.");
      qc.invalidateQueries({ queryKey: ["admin", "purchases"] });
      qc.invalidateQueries({ queryKey: ["purchases", "active"] });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível cancelar a compra."));
    } finally {
      setPending(null);
    }
  };

  if (isLoading)
    return (
      <div className="rounded-3xl glass-panel p-8 text-center text-slate-400">
        Carregando histórico de compras...
      </div>
    );
  if (isError)
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300">
        {apiErrorMessage(error)}
      </div>
    );

  const purchases = data ?? [];

  return (
    <div className="overflow-hidden rounded-3xl glass-panel border border-white/10">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-900/90 border-b border-white/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400 py-4">Produto</TableHead>
              <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Valor Unitário</TableHead>
              <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Adesões</TableHead>
              <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Prazo</TableHead>
              <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Status</TableHead>
              <TableHead className="text-xs uppercase font-extrabold tracking-wider text-slate-400 text-right pr-6">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((p) => (
              <TableRow key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-bold text-white py-4">{p.product}</TableCell>
                <TableCell className="font-extrabold text-emerald-400">{formatBRL(p.unitPrice)}</TableCell>
                <TableCell className="text-slate-200 font-semibold">
                  {p.currentQuantity} de {p.minimumQuantity}
                </TableCell>
                <TableCell className="text-slate-400 text-xs">{formatDateTime(p.term)}</TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold"
                    disabled={pending === p._id || p.status === "cancelled"}
                    onClick={() => cancel(p._id)}
                  >
                    {pending === p._id ? "..." : "Cancelar Compra"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                  Nenhuma compra coletiva encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}