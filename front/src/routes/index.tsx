import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ShoppingCart } from "lucide-react";
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

  const list = useMemo(() => {
    const items = (data ?? []).filter((p) => p.status === "active");
    const filtered = q
      ? items.filter((p) => p.product?.toLowerCase().includes(q.toLowerCase()))
      : items;
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "deadline") {
        return new Date(a.term).getTime() - new Date(b.term).getTime();
      }
      return new Date(b.term).getTime() - new Date(a.term).getTime();
    });
    return sorted;
  }, [data, q, sort]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Compras ativas</h1>
        <p className="text-sm text-slate-500">
          Participe das compras coletivas em andamento no seu condomínio.
        </p>
      </header>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar product..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as "deadline" | "recent")}>
          <SelectTrigger className="w-full sm:w-56">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Encerra em breve</SelectItem>
            <SelectItem value="recent">Prazo mais distante</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          Carregando compras...
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {apiErrorMessage(error, "Não foi possível carregar as compras.")}
        </div>
      )}

      {!isLoading && !isError && list.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-slate-700 font-medium">Nenhuma purchase ativa no momento.</p>
          <p className="text-sm text-slate-500">Que tal propor uma nova?</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {list.map((p) => (
          <PurchaseCard key={p._id} purchase={p} />
        ))}
      </div>
    </div>
  );
}