import { CloudRain, CloudSun, Droplets, Sun } from "lucide-react";

import { getRainLevel } from "../../utils/dengueStats";

interface WeatherIndicatorProps {
  rain: number;
  temp: number;
  humidity: number;
  compact?: boolean;
}

const rainStyles = {
  dry: {
    icon: Sun,
    bar: "bg-amber-400/70",
    text: "text-amber-300",
    fill: 10,
  },
  light: {
    icon: CloudSun,
    bar: "bg-sky-400/70",
    text: "text-sky-300",
    fill: 35,
  },
  moderate: {
    icon: Droplets,
    bar: "bg-blue-400/80",
    text: "text-blue-300",
    fill: 65,
  },
  heavy: {
    icon: CloudRain,
    bar: "bg-indigo-400/90",
    text: "text-indigo-300",
    fill: 100,
  },
};

export default function WeatherIndicator({
  rain,
  temp,
  humidity,
  compact = false,
}: WeatherIndicatorProps) {
  const rainInfo = getRainLevel(rain);
  const style = rainStyles[rainInfo.level];
  const Icon = style.icon;

  return (
    <div className={`space-y-3 ${compact ? "" : "mt-2"}`}>
      <div className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.bar}`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${style.text}`}>{rainInfo.label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{rainInfo.description}</p>

          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all ${style.bar}`}
              style={{ width: `${style.fill}%` }}
            />
          </div>

          <p className="text-[11px] text-zinc-500 mt-1">{rain.toFixed(1)} mm rainfall</p>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-zinc-800/60 px-3 py-2">
            <p className="text-zinc-500">Temperature</p>
            <p className="text-zinc-200 mt-0.5">{temp.toFixed(1)}°C</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 px-3 py-2">
            <p className="text-zinc-500">Humidity</p>
            <p className="text-zinc-200 mt-0.5">{humidity.toFixed(0)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
