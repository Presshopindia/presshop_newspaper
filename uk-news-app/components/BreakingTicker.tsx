interface BreakingTickerProps {
  headlines: string[];
}

export default function BreakingTicker({ headlines }: BreakingTickerProps) {
  const text =
    headlines.length > 0
      ? headlines.join("  •  ")
      : "Live updates will appear here shortly.";

  return (
    <section className="overflow-hidden rounded-lg border border-red-200 bg-red-50">
      <div className="flex items-center">
        <span className="shrink-0 bg-red-600 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white">
          Breaking
        </span>
        <div className="w-full overflow-hidden whitespace-nowrap py-3">
          <div className="animate-ticker pr-8 text-sm font-medium text-slate-800">
            {text}
          </div>
        </div>
      </div>
    </section>
  );
}
