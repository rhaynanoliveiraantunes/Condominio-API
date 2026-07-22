import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";

export function StatusBadge({ status, className }: { status?: string; className?: string }) {
  const style =
    status === "active"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : status === "goal_reached" // <-- Nova regra adicionada aqui!
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : status === "expired"
          ? "bg-amber-100 text-amber-700 border-amber-200"
          : status === "cancelled"
            ? "bg-red-100 text-red-700 border-red-200"
            : status === "closed"
              ? "bg-slate-200 text-slate-700 border-slate-300"
              : "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        style,
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}