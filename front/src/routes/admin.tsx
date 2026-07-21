import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
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
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Painel administrativo</h1>
        <p className="text-sm text-slate-500">Gerencie moradores e compras do condomínio.</p>
      </header>

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
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
    queryFn: async () => (await api.get<User[]>("/admin/users")).data,
  });

  const toggle = async (u: User) => {
    const id = u._id ?? u.id;
    if (!id) return;
    setPending(id);
    try {
      await api.put(`/admin/users/${id}`, { active: !u.active });
      toast.success(u.active ? "Usuário desativado." : "Usuário ativado.");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível atualizar o usuário."));
    } finally {
      setPending(null);
    }
  };

  if (isLoading)
    return <div className="rounded-xl bg-white p-6 text-slate-500">Carregando...</div>;
  if (isError)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {apiErrorMessage(error)}
      </div>
    );

  const users = data ?? [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Apto</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead className="text-right">Ativo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => {
            const id = u._id ?? u.id ?? "";
            return (
              <TableRow key={id}>
                <TableCell className="font-medium">{u.name ?? "-"}</TableCell>
                <TableCell className="text-slate-600">{u.email ?? "-"}</TableCell>
                <TableCell>{u.apartment ?? "-"}</TableCell>
                <TableCell className="capitalize">{u.role ?? "user"}</TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={!!u.active}
                    disabled={pending === id}
                    onCheckedChange={() => toggle(u)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-slate-500">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
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
    if (!window.confirm("Cancelar esta purchase? Os dados serão preservados.")) return;
    setPending(id);
    try {
      await api.patch(`/purchases/${id}/cancel`);
      toast.success("Compra cancelada.");
      qc.invalidateQueries({ queryKey: ["admin", "purchases"] });
      qc.invalidateQueries({ queryKey: ["purchases", "active"] });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível cancelar a purchase."));
    } finally {
      setPending(null);
    }
  };

  if (isLoading)
    return <div className="rounded-xl bg-white p-6 text-slate-500">Carregando...</div>;
  if (isError)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {apiErrorMessage(error)}
      </div>
    );

  const purchases = data ?? [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((p) => (
            <TableRow key={p._id}>
              <TableCell className="font-medium">{p.product}</TableCell>
              <TableCell>{formatBRL(p.unitPrice)}</TableCell>
              <TableCell>
                {p.currentQuantity} / {p.minimumQuantity}
              </TableCell>
              <TableCell className="text-slate-600">{formatDateTime(p.term)}</TableCell>
              <TableCell>
                <StatusBadge status={p.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={pending === p._id || p.status === "cancelled"}
                  onClick={() => cancel(p._id)}
                >
                  {pending === p._id ? "..." : "Cancelar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {purchases.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-6 text-center text-slate-500">
                Nenhuma purchase encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}