import DengueMap from "./DengueMap";

import type { WeeklyDataPayload } from "../../types/dengue";

interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: { name: string };
    geometry: GeoJSON.Geometry;
  }>;
}

interface ComparisonMapProps {
  geoJson: GeoJsonFeatureCollection | null;
  weekA: WeeklyDataPayload | null;
  weekB: WeeklyDataPayload | null;
  labelA: string;
  labelB: string;
  selectedDistricts: string[];
  onDistrictSelect: (district: string) => void;
}

export default function ComparisonMap({
  geoJson,
  weekA,
  weekB,
  labelA,
  labelB,
  selectedDistricts,
  onDistrictSelect,
}: ComparisonMapProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">
        Tap a district on either map to add or remove it from the comparison dashboard.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
            {labelA}
          </h3>
          <DengueMap
            geoJson={geoJson}
            weeklyData={weekA}
            selectedDistricts={selectedDistricts}
            onDistrictSelect={onDistrictSelect}
            compact
          />
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
            {labelB}
          </h3>
          <DengueMap
            geoJson={geoJson}
            weeklyData={weekB}
            selectedDistricts={selectedDistricts}
            onDistrictSelect={onDistrictSelect}
            compact
          />
        </div>
      </div>
    </div>
  );
}
