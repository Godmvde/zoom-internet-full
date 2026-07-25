import { serviceStatus } from "@/lib/content";
import { makeT, type Overrides } from "@/lib/t";

export default function StatusBadge({ light = false, overrides }: { light?: boolean; overrides?: Overrides }) {
  const t = makeT(overrides);
  const ok = serviceStatus.operational;
  const color = ok ? "#16a34a" : "#f59e0b";
  const message = t("status.message", serviceStatus.message);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        light
          ? "bg-white/10 text-white/90"
          : "bg-[var(--color-mist)] text-[var(--color-heading)] border border-[var(--color-line)]"
      }`}
      title={message}
    >
      <span className="relative flex w-2.5 h-2.5">
        <span className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: color }} />
        <span className="relative w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      </span>
      <span data-rtr-field="ov:status.message">{message}</span>
    </span>
  );
}
