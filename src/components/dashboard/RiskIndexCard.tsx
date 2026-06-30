const riskStyles = {
  High: "text-red-300",
  Medium: "text-amber-300",
  Low: "text-green-300",
};

interface RiskIndexCardProps {
  risk: "High" | "Medium" | "Low";
  totalCases: number;
  totalCumulative: number;
  previousCumulative: number;
  hotSpots: number;
  change: number;
  cumulativeChange: number;
  heavyRainDistricts: number;
  latestDate: string;
}

export default function RiskIndexCard({
  risk,
  totalCases,
  totalCumulative,
  previousCumulative,
  hotSpots,
  change,
  cumulativeChange,
  heavyRainDistricts,
  latestDate,
}: RiskIndexCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4 sm:p-5">
      <p className="text-xs uppercase tracking-wide text-zinc-500">National overview</p>
      <h2 className={`text-lg font-medium mt-1 ${riskStyles[risk]}`}>
        {risk} risk
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Weekly cases</dt>
          <dd className="text-zinc-100 tabular-nums">{totalCases}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Cumulative total</dt>
          <dd className="text-zinc-100 tabular-nums">{totalCumulative.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Previous cumulative</dt>
          <dd className="text-zinc-400 tabular-nums">
            {previousCumulative.toLocaleString()}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Cumulative change</dt>
          <dd
            className={`tabular-nums ${
              cumulativeChange >= 0 ? "text-red-300" : "text-green-300"
            }`}
          >
            {cumulativeChange >= 0 ? "+" : ""}
            {cumulativeChange}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Weekly change</dt>
          <dd
            className={`tabular-nums ${
              change >= 0 ? "text-red-300" : "text-green-300"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">High-risk districts</dt>
          <dd className="text-zinc-100 tabular-nums">{hotSpots}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Heavy rain areas</dt>
          <dd className="text-indigo-300 tabular-nums">{heavyRainDistricts}</dd>
        </div>
      </dl>

      <p className="text-[11px] text-zinc-600 mt-4">Updated {latestDate}</p>
    </div>
  );
}
