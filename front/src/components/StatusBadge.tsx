import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";

export function StatusBadge({ status, className }: { status?: string; className?: string }) {
  const badgeStyle =
    status === "OPEN" || status === "active"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
      : status === "MINIMUM_REACHED" || status === "goal_reached" || status === "CONFIRMED"
        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
        : status === "PAID_VERIFYING"
          ? "bg-sky-500/10 text-sky-300 border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.15)]"
          : status === "PENDING_PIX"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
            : status === "REFUND_PENDING"
              ? "bg-orange-500/10 text-orange-300 border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.15)]"
              : status === "REFUNDED"
                ? "bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                : status === "CANCELLED" || status === "cancelled"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : "bg-slate-500/10 text-slate-400 border-slate-600/30";

  const dotStyle =
    status === "OPEN" || status === "active"
      ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"
      : status === "MINIMUM_REACHED" || status === "goal_reached" || status === "CONFIRMED"
        ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
        : status === "PAID_VERIFYING"
          ? "bg-sky-400 animate-pulse"
          : status === "PENDING_PIX"
            ? "bg-amber-400"
            : status === "REFUND_PENDING"
              ? "bg-orange-400 animate-pulse"
              : status === "REFUNDED"
                ? "bg-purple-400"
                : status === "CANCELLED" || status === "cancelled"
                  ? "bg-rose-400"
                  : "bg-slate-400";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide backdrop-blur-md transition-all",
        badgeStyle,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyle)} />
      {statusLabel(status)}
    </span>
  );
}