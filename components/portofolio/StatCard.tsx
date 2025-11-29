    // components/dashboard/StatCard.tsx
import React from "react";

type StatCardProps = {
  label: string;
  value: string;
  subtitle?: string;
  tone?: "default" | "positive" | "negative";
};

export function StatCard({
  label,
  value,
  subtitle,
  tone = "default",
}: StatCardProps) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
      ? "text-rose-400"
      : "text-slate-50";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-lg font-semibold ${toneClass}`}>{value}</p>
      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
