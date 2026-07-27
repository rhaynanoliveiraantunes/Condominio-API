import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";

export function StatusBadge({ status, className }: { status?: string; className?: string }) {
  const badgeStyle =
    status === "active"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
      : status === "goal_reached"
        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
        : status === "expired"
          ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          : status === "cancelled"
            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
            : status === "closed"
              ? "bg-slate-500/10 text-slate-300 border-slate-500/30"
              : "bg-slate-500/10 text-slate-400 border-slate-600/30";

  const dotStyle =
    status === "active"
      ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"
      : status === "goal_reached"
        ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
        : status === "expired"
          ? "bg-amber-400"
          : status === "cancelled"
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