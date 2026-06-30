import { useEffect, useRef } from "react";
import L from "leaflet";

import type { WeeklyDataPayload } from "../../types/dengue";
import { getRiskColor, SRI_LANKA_BOUNDS } from "../../utils/dengueStats";

interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: { name: string };
    geometry: GeoJSON.Geometry;
  }>;
}

interface DengueMapProps {
  geoJson: GeoJsonFeatureCollection | null;
  weeklyData: WeeklyDataPayload | null;
  selectedDistrict?: string | null;
  selectedDistricts?: string[];
  onDistrictSelect: (district: string) => void;
  compact?: boolean;
}

export default function DengueMap({
  geoJson,
  weeklyData,
  selectedDistrict = null,
  selectedDistricts,
  onDistrictSelect,
  compact = false,
}: DengueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const onSelectRef = useRef(onDistrictSelect);
  const boundsRef = useRef<L.LatLngBounds | null>(null);

  onSelectRef.current = onDistrictSelect;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) {
      return;
    }

    const sriLankaBounds = L.latLngBounds(SRI_LANKA_BOUNDS);

    const map = L.map(mapRef.current, {
      center: [7.8731, 80.7718],
      zoom: compact ? 7 : 7,
      zoomControl: !compact,
      attributionControl: !compact,
      dragging: true,
      scrollWheelZoom: !compact,
      doubleClickZoom: !compact,
      maxBounds: sriLankaBounds.pad(0.02),
      maxBoundsViscosity: 1,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    mapInstanceRef.current = map;
    boundsRef.current = sriLankaBounds;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [compact]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoJson) {
      return;
    }

    if (geoLayerRef.current) {
      geoLayerRef.current.remove();
    }

    geoLayerRef.current = L.geoJSON(geoJson, {
      style: (feature) => {
        const name = feature?.properties?.name as string;
        const metrics = weeklyData?.districts[name];
        const isSelected = selectedDistricts
          ? selectedDistricts.includes(name)
          : name === selectedDistrict;

        return {
          fillColor: getRiskColor(metrics?.risk),
          weight: isSelected ? 2.5 : 0.8,
          opacity: 1,
          color: isSelected ? "#fafafa" : "#3f3f46",
          fillOpacity: isSelected ? 0.85 : 0.7,
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name as string;
        const metrics = weeklyData?.districts[name];
        const popupContent = metrics
          ? `<strong>${name}</strong><br/>Cases: ${metrics.cases}<br/>Cumulative: ${metrics.cumulative}<br/>Risk: ${metrics.risk}`
          : `<strong>${name}</strong><br/>No data`;

        layer.bindPopup(popupContent);

        layer.on("click", () => {
          onSelectRef.current(name);
        });

        layer.on("mouseover", () => {
          if (layer instanceof L.Path) {
            layer.setStyle({ weight: 2, color: "#fafafa" });
          }
        });

        layer.on("mouseout", () => {
          if (geoLayerRef.current) {
            geoLayerRef.current.resetStyle(layer as L.Path);
          }
        });
      },
    }).addTo(map);

    const layerBounds = geoLayerRef.current.getBounds();
    boundsRef.current = layerBounds;
    map.fitBounds(layerBounds, {
      padding: compact ? [8, 8] : [16, 16],
      maxZoom: compact ? 8 : 8,
    });
    map.setMinZoom(map.getBoundsZoom(layerBounds.pad(0.05)));

    return () => {
      geoLayerRef.current?.remove();
      geoLayerRef.current = null;
    };
  }, [geoJson, weeklyData, selectedDistrict, selectedDistricts, compact]);

  return (
    <div
      className={`overflow-hidden rounded-lg border border-zinc-800/60 ${
        compact ? "h-[220px] sm:h-[260px]" : "h-[320px] sm:h-[420px] lg:h-[480px]"
      }`}
    >
      <div ref={mapRef} className="h-full w-full bg-zinc-950" />
    </div>
  );
}
