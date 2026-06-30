import { useEffect, useState } from "react";

import type { DengueTimeSeriesDataset } from "../types/dengue";

interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: { name: string };
    geometry: GeoJSON.Geometry;
  }>;
}

export function useDengueData() {
  const [data, setData] = useState<DengueTimeSeriesDataset | null>(null);
  const [geoJson, setGeoJson] = useState<GeoJsonFeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL;

    Promise.all([
      fetch(`${baseUrl}data/dengue_map_data.json`).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load dengue data");
        }
        return response.json();
      }),
      fetch(`${baseUrl}data/lk.json`).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load map boundaries");
        }
        return response.json();
      }),
    ])
      .then(([dengueData, geoData]) => {
        setData(dengueData);
        setGeoJson(geoData);
      })
      .catch((fetchError: Error) => {
        setError(fetchError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const timelineKeys = data ? Object.keys(data).sort() : [];

  return { data, geoJson, timelineKeys, loading, error };
}
