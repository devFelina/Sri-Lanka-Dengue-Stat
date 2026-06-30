import { X, ArrowRight, ShieldAlert, CloudRain, TrendingUp, Info } from "lucide-react";
import type { WeeklyDataPayload } from "../../types/dengue";
import { getRiskColor, getRainLevel } from "../../utils/dengueStats";

interface DistrictComparisonTableProps {
  selectedDistricts: string[];
  weekA: WeeklyDataPayload;
  weekB: WeeklyDataPayload;
  labelA: string;
  labelB: string;
  onRemoveDistrict: (district: string) => void;
}

export default function DistrictComparisonTable({
  selectedDistricts,
  weekA,
  weekB,
  labelA,
  labelB,
  onRemoveDistrict,
}: DistrictComparisonTableProps) {
  if (selectedDistricts.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-8 text-center">
        <Info className="mx-auto h-8 w-8 text-zinc-600 mb-3" />
        <h3 className="text-sm font-medium text-zinc-300">No districts selected for comparison</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Tap districts on the map above or search in the dropdown to add them to your comparison dashboard.
        </p>
      </div>
    );
  }

  // Get data for selected districts
  const comparedData = selectedDistricts.map((name) => {
    const metricsA = weekA.districts[name] ?? {
      cases: 0,
      cumulative: 0,
      temp: 0,
      rain: 0,
      humidity: 0,
      risk: "Low",
    };
    const metricsB = weekB.districts[name] ?? {
      cases: 0,
      cumulative: 0,
      temp: 0,
      rain: 0,
      humidity: 0,
      risk: "Low",
    };

    const caseChange = metricsB.cases - metricsA.cases;
    const cumulativeChange = metricsB.cumulative - metricsA.cumulative;
    const rainLevelA = getRainLevel(metricsA.rain);
    const rainLevelB = getRainLevel(metricsB.rain);

    return {
      name,
      metricsA,
      metricsB,
      caseChange,
      cumulativeChange,
      rainLevelA,
      rainLevelB,
    };
  });

  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 overflow-hidden shadow-xl">
      <div className="p-4 sm:p-5 border-b border-zinc-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium text-zinc-100">District-by-District Comparison</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Comparing selected districts for {labelA} vs {labelB}
          </p>
        </div>
        <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full font-medium">
          {selectedDistricts.length} {selectedDistricts.length === 1 ? "district" : "districts"}
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <table className="w-full min-w-[650px] border-collapse text-left text-sm text-zinc-300">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-950/20">
              <th className="sticky left-0 z-10 bg-zinc-950/95 backdrop-blur-md px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-r border-zinc-800/60 w-[180px]">
                Metric
              </th>
              {comparedData.map((d) => (
                <th key={d.name} className="px-5 py-3 border-r border-zinc-800/40 last:border-r-0 min-w-[180px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-100">{d.name}</span>
                    <button
                      onClick={() => onRemoveDistrict(d.name)}
                      className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50 transition-colors"
                      title={`Remove ${d.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {/* WEEKLY CASES */}
            <tr className="hover:bg-zinc-800/10">
              <td className="sticky left-0 z-10 bg-zinc-950/95 backdrop-blur-md px-4 py-4 text-xs font-medium uppercase tracking-wider text-zinc-400 border-r border-zinc-800/60 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
                Weekly Cases
              </td>
              {comparedData.map((d) => (
                <td key={d.name} className="px-5 py-4 border-r border-zinc-800/40 last:border-r-0">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-sky-300 font-mono font-medium">{d.metricsA.cases}</span>
                      <ArrowRight className="h-3 w-3 text-zinc-600" />
                      <span className="text-violet-300 font-mono font-medium">{d.metricsB.cases}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium tabular-nums ${
                        d.caseChange >= 0
                          ? "bg-red-950/40 text-red-300 border border-red-900/30"
                          : "bg-green-950/40 text-green-300 border border-green-900/30"
                      }`}
                    >
                      {d.caseChange >= 0 ? "+" : ""}
                      {d.caseChange}
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* RISK LEVEL */}
            <tr className="hover:bg-zinc-800/10">
              <td className="sticky left-0 z-10 bg-zinc-950/95 backdrop-blur-md px-4 py-4 text-xs font-medium uppercase tracking-wider text-zinc-400 border-r border-zinc-800/60 flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-zinc-500" />
                Risk Status
              </td>
              {comparedData.map((d) => (
                <td key={d.name} className="px-5 py-4 border-r border-zinc-800/40 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: getRiskColor(d.metricsA.risk) }}
                      />
                      <span className="text-zinc-400 font-medium">{d.metricsA.risk}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-zinc-600" />
                    <div className="flex items-center gap-1 text-xs">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: getRiskColor(d.metricsB.risk) }}
                      />
                      <span className="text-zinc-100 font-semibold">{d.metricsB.risk}</span>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            {/* CUMULATIVE CASES */}
            <tr className="hover:bg-zinc-800/10">
              <td className="sticky left-0 z-10 bg-zinc-950/95 backdrop-blur-md px-4 py-4 text-xs font-medium uppercase tracking-wider text-zinc-400 border-r border-zinc-800/60 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-zinc-500 animate-pulse" />
                Cumulative Cases
              </td>
              {comparedData.map((d) => (
                <td key={d.name} className="px-5 py-4 border-r border-zinc-800/40 last:border-r-0">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-sky-300/80 font-mono">{d.metricsA.cumulative.toLocaleString()}</span>
                      <ArrowRight className="h-3 w-3 text-zinc-600" />
                      <span className="text-violet-300/85 font-mono">{d.metricsB.cumulative.toLocaleString()}</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono tabular-nums">
                      +{d.cumulativeChange}
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* RAINFALL */}
            <tr className="hover:bg-zinc-800/10">
              <td className="sticky left-0 z-10 bg-zinc-950/95 backdrop-blur-md px-4 py-4 text-xs font-medium uppercase tracking-wider text-zinc-400 border-r border-zinc-800/60 flex items-center gap-2">
                <CloudRain className="h-3.5 w-3.5 text-zinc-500" />
                Rainfall & Level
              </td>
              {comparedData.map((d) => (
                <td key={d.name} className="px-5 py-4 border-r border-zinc-800/40 last:border-r-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-sky-300 font-mono font-medium">{d.metricsA.rain.toFixed(1)}mm</span>
                      <ArrowRight className="h-3 w-3 text-zinc-650" />
                      <span className="text-violet-300 font-mono font-medium">{d.metricsB.rain.toFixed(1)}mm</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                      <span>{d.rainLevelA.label}</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                      <span className="text-zinc-400">{d.rainLevelB.label}</span>
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
