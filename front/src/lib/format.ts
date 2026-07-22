export function formatBRL(value: number | string | undefined | null): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (n == null || Number.isNaN(n)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(n));
}

export function formatDate(iso: string | Date | undefined | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(iso: string | Date | undefined | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function toDatetimeLocalMin(): string {
  const now = new Date();
  const tz = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 16);
}

export function statusLabel(status: string | undefined): string {
  switch (status) {
    case "active":
      return "Ativa";
    case "goal_reached":
      return "Concluída";
    case "closed":
      return "Encerrada";
    case "cancelled":
      return "Cancelada";
    case "expired":
      return "Expirada";
    default:
      return status ?? "-";
  }
}