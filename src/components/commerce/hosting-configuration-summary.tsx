import { cn } from "@/lib/utils";

export function HostingConfigurationSummary({
  lines,
  className,
  tone = "default"
}: {
  lines: string[];
  className?: string;
  tone?: "default" | "subtle";
}) {
  if (lines.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {lines.map((line) => (
        <span
          key={line}
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.02em]",
            tone === "subtle"
              ? "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400"
              : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200"
          )}
        >
          {line}
        </span>
      ))}
    </div>
  );
}
