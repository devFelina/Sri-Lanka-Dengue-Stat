import type { DistrictMetrics, WeeklyDataPayload } from "../types/dengue";

export function getWeeklyPayload(
  data: Record<string, WeeklyDataPayload>,
  dateKey: string
): WeeklyDataPayload | null {
  return data[dateKey] ?? null;
}

export function getPreviousDateKey(
  timelineKeys: string[],
  selectedDate: string
): string | null {
  const index = timelineKeys.indexOf(selectedDate);
  return index > 0 ? timelineKeys[index - 1] : null;
}

export function getTopDistricts(week: WeeklyDataPayload, limit = 5) {
  return Object.entries(week.districts)
    .map(([name, metrics]) => ({
      name,
      cases: metrics.cases,
      cumulative: metrics.cumulative,
    }))
    .sort((a, b) => b.cases - a.cases)
    .slice(0, limit);
}

export function getNationalStats(
  week: WeeklyDataPayload,
  previousWeek?: WeeklyDataPayload | null
) {
  const districts = Object.values(week.districts);
  const totalCases = districts.reduce((sum, district) => sum + district.cases, 0);
  const totalCumulative = districts.reduce(
    (sum, district) => sum + district.cumulative,
    0
  );
  const hotSpots = districts.filter((district) => district.risk === "High").length;

  const previousDistricts = previousWeek
    ? Object.values(previousWeek.districts)
    : [];
  const previousTotal = previousDistricts.reduce(
    (sum, district) => sum + district.cases,
    0
  );
  const previousCumulative = previousDistricts.reduce(
    (sum, district) => sum + district.cumulative,
    0
  );

  const highCount = districts.filter((district) => district.risk === "High").length;
  const mediumCount = districts.filter(
    (district) => district.risk === "Medium"
  ).length;

  let risk: "High" | "Medium" | "Low" = "Low";
  if (highCount >= 5) {
    risk = "High";
  } else if (highCount >= 2 || mediumCount >= 8) {
    risk = "Medium";
  }

  const heavyRainDistricts = districts.filter(
    (district) => getRainLevel(district.rain).level === "heavy"
  ).length;

  return {
    totalCases,
    totalCumulative,
    previousCumulative,
    hotSpots,
    change: previousWeek ? totalCases - previousTotal : 0,
    cumulativeChange: previousWeek ? totalCumulative - previousCumulative : 0,
    risk,
    endDate: week.end_date,
    heavyRainDistricts,
  };
}

export function getRiskColor(risk: DistrictMetrics["risk"] | undefined): string {
  switch (risk) {
    case "High":
      return "#dc2626";
    case "Medium":
      return "#d97706";
    case "Low":
      return "#16a34a";
    default:
      return "#52525b";
  }
}

export type RainLevel = "dry" | "light" | "moderate" | "heavy";

export function getRainLevel(rainMm: number): {
  level: RainLevel;
  label: string;
  description: string;
} {
  if (rainMm < 1) {
    return {
      level: "dry",
      label: "Dry",
      description: "Little to no rainfall this week",
    };
  }
  if (rainMm < 10) {
    return {
      level: "light",
      label: "Light rain",
      description: "Some showers, limited breeding risk",
    };
  }
  if (rainMm < 30) {
    return {
      level: "moderate",
      label: "Moderate rain",
      description: "Steady rain may increase standing water",
    };
  }
  return {
    level: "heavy",
    label: "Heavy rain",
    description: "Heavy rainfall — higher mosquito breeding risk",
  };
}

export const RISK_LEGEND = {
  district: [
    {
      color: "#dc2626",
      label: "High",
      rule: "Assigned when weekly cases and environmental signals exceed high thresholds in the dataset.",
    },
    {
      color: "#d97706",
      label: "Medium",
      rule: "Moderate case activity or mixed weather conditions.",
    },
    {
      color: "#16a34a",
      label: "Low",
      rule: "Lower weekly cases with favourable conditions.",
    },
  ],
  national: [
    "National risk is High when 5 or more districts are High.",
    "Medium when 2+ districts are High, or 8+ districts are Medium.",
    "Otherwise the national level is Low.",
  ],
};

export const SRI_LANKA_BOUNDS: [[number, number], [number, number]] = [
  [5.85, 79.45],
  [9.95, 82.05],
];
