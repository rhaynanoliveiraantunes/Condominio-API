import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ShoppingCart, Sparkles, TrendingUp, Users } from "lucide-react";
import { ProtectedLayout } from "@/components/AppLayout";
import { PurchaseCard, type Purchase } from "@/components/PurchaseCard";
import { api, apiErrorMessage } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Compras ativas — CondomínioBuy" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <ProtectedLayout>
      <ActivePurchases />
    </ProtectedLayout>
  );
}

function ActivePurchases() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"deadline" | "recent">("deadline");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["purchases", "active"],
    queryFn: async () => (await api.get<Purchase[]>("/purchases")).data,
  });

  const activeItems = useMemo(() => (data ?? []).filter((p) => p.status === "active"), [data]);

  const totalParticipants = useMemo(
    () => activeItems.reduce((acc, curr) => acc + (curr.currentQuantity || 0), 0),
    [activeItems],
  );

  const list = useMemo(() => {
    const filtered = q
      ? activeItems.filter((p) => p.product?.toLowerCase().includes(q.toLowerCase()))
      : activeItems;
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "deadline") {
        return new Date(a.term).getTime() - new Date(b.term).getTime();
      }
      return new Date(b.term).getTime() - new Date(a.term).getTime();
    });
    return sorted;
  }, [activeItems, q, sort]);

  return (
    <div className="space-y-8">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-10">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Economia Coletiva do Condomínio
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Compras Ativas em <span className="gradient-text-emerald">Andamento</span>
            </h1>
            <p className="text-sm text-slate-300 md:text-base leading-relaxed">
              Junte-se aos vizinhos para alcançar a quantidade mínima de pedidos e garantir os melhores preços em grupo.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4 lg:w-80">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <ShoppingCart className="h-4 w-4 text-emerald-400" />
                Em andamento
              </div>
              <p className="mt-2 text-2xl font-extrabold text-white">{activeItems.length}</p>
              <p className="text-[11px] text-slate-400">campanhas ativas</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Users className="h-4 w-4 text-cyan-400" />
                Adesões
              </div>
              <p className="mt-2 text-2xl font-extrabold text-white">{totalParticipants}</p>
              <p className="text-[11px] text-slate-400">unidades confirmadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar produto ou item..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 h-11 rounded-xl glass-input text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 hidden sm:inline-block">Ordenar:</span>
          <Select value={sort} onValueChange={(v) => setSort(v as "deadline" | "recent")}>
            <SelectTrigger className="h-11 w-full sm:w-56 rounded-xl border border-white/10 bg-slate-900/80 text-slate-200 backdrop-blur-md focus:ring-emerald-500">
              <ArrowUpDown className="mr-2 h-4 w-4 text-emerald-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border border-white/10 text-slate-200">
              <SelectItem value="deadline">Encerra em breve</SelectItem>
              <SelectItem value="recent">Prazo mais distante</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-56 animate-pulse rounded-2xl border border-white/10 bg-slate-900/40 p-6" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300">
          {apiErrorMessage(error, "Não foi possível carregar as compras ativas.")}
        </div>
      )}

      {/* Empty list state */}
      {!isLoading && !isError && list.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/30 p-12 text-center backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Nenhuma compra ativa encontrada</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
            {q ? "Tente buscar com outros termos." : "Todas as campanhas atuais foram encerradas ou concluídas."}
          </p>
        </div>
      )}

      {/* Purchases Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {list.map((p) => (
          <PurchaseCard key={p._id} purchase={p} />
        ))}
      </div>
    </div>
  );
}