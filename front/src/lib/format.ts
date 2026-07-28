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
    case "OPEN":
    case "active":
      return "Aberta para Adesão";
    case "MINIMUM_REACHED":
    case "goal_reached":
      return "Meta Atingida";
    case "closed":
      return "Encerrada";
    case "CANCELLED":
    case "cancelled":
      return "Cancelada";
    case "expired":
      return "Expirada";
    case "PENDING_PIX":
      return "Pagar via PIX";
    case "PAID_VERIFYING":
      return "Aguardando Síndico";
    case "CONFIRMED":
      return "Pagamento Confirmado";
    case "REFUND_PENDING":
      return "Reembolso Pendente";
    case "REFUNDED":
      return "Reembolsado";
    default:
      return status ?? "-";
  }
}