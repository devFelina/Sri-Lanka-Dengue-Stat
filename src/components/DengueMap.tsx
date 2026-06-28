import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DengueMapProps {
  weeklyData: any;
  onDistrictSelect: (name: string) => void;
}

// Name dictionary translating transliterated names in lk.json to match dashboard metrics keys
const districtNameMap: Record<string, string> = {
  "Ampara": "Ampara", "Anuradhapura": "Anuradhapura", "Badulla": "Badulla",
  "Batticaloa": "Batticaloa", "Colombo": "Colombo", "Galle": "Galle",
  "Gampaha": "Gampaha", "Hambantota": "Hambantota", "Jaffna": "Jaffna",
  "Kalutara": "Kalutara", "Kandy": "Kandy", "Kegalle": "Kegalle",
  "Kilinochchi": "Kilinochchi", "Kurunegala": "Kurunegala", "Mannar": "Mannar",
  "Matale": "Matale", "Matara": "Matara", "Moneragala": "Moneragala",
  "Mullaitivu": "Mullaitivu", "Nuwara Eliya": "Nuwara Eliya", 
  "Polonnaruwa": "Polonnaruwa", "Puttalam": "Puttalam", 
  "Ratnapura": "Ratnapura", "Trincomalee": "Trincomalee", "Vavuniya": "Vavuniya"
};

// Map boundaries locking focus tightly over Sri Lanka coordinates
const SRI_LANKA_BOUNDS = L.latLngBounds(L.latLng(5.5, 79.2), L.latLng(10.0, 82.2));

export default function DengueMap({ weeklyData, onDistrictSelect }: DengueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const getFillColor = (geoName: string) => {
    if (!weeklyData || !weeklyData.districts) return '#1c1c1e';
    const correctedName = districtNameMap[geoName] || geoName;
    const cleanGeoName = correctedName.toLowerCase().replace(/district/g, '').trim();

    let matchedKey = Object.keys(weeklyData.districts).find((key) => 
      key.toLowerCase().replace(/district/g, '').trim() === cleanGeoName
    );

    // Fallback mapping Kalmunai health data into Ampara district boundaries
    if (!matchedKey && cleanGeoName === 'ampara' && weeklyData.districts['Kalmunai']) {
      matchedKey = 'Kalmunai';
    }

    if (!matchedKey) return '#27272a'; // Gray fallback for unmapped vectors

    const cases = weeklyData.districts[matchedKey].cases;
    if (cases >= 20) return '#ef4444'; // Elevated Outbreak Red
    if (cases >= 10) return '#f97316'; // Warning Alert Orange
    if (cases > 0)   return '#eab308'; // Low Active Yellow
    return '#3f3f46';                  // Baseline Controlled Grey
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Safety cleanup: Destroy instance if it already exists before remounting
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize map frame with strict boundaries
    const mapInstance = L.map(mapContainerRef.current, {
      center: [7.8731, 80.7718],
      zoom: 7.3,
      minZoom: 7, 
      maxZoom: 10,
      maxBounds: SRI_LANKA_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      attributionControl: false
    });

    mapRef.current = mapInstance;

    // Force container sizing validation recalculation
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 200);

    // ✅ READ EXCLUSIVELY FROM LOCAL GEOMAP ASSET (NO EXTERNAL API TILES OR INTERNET CALLS)
    fetch('./data/lk.json')
      .then((res) => res.json())
      .then((geoData) => {
        if (!mapRef.current) return;

        const geoLayer = L.geoJSON(geoData, {
          style: (feature: any) => {
            const rawName = feature.properties.name || feature.properties.NAME_1 || "";
            return {
              fillColor: getFillColor(rawName),
              weight: 1.5,
              opacity: 1,
              color: '#09090b', // Clean dark divider border lines separating districts
              fillOpacity: 0.85,
            };
          },
          onEachFeature: (feature, layer) => {
            const rawName = feature.properties.name || feature.properties.NAME_1 || "";
            const correctedName = districtNameMap[rawName] || rawName;
            
            layer.on({
              click: () => onDistrictSelect(correctedName),
              mouseover: (e) => e.target.setStyle({ weight: 2.5, color: '#ffffff', fillOpacity: 0.95 }),
              mouseout: (e) => {
                if (geoJsonLayerRef.current) geoJsonLayerRef.current.resetStyle(e.target);
              }
            });
          }
        }).addTo(mapInstance);

        geoJsonLayerRef.current = geoLayer;

        // Automatically snap and pad the viewport around the loaded districts geometry
        const bounds = geoLayer.getBounds();
        if (bounds.isValid()) {
          mapInstance.fitBounds(bounds, { padding: [20, 20] });
        }
      })
      .catch((err) => console.error("Error parsing local lk.json file structure:", err));

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Hot Reload listener handling time slider indices changes
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.eachLayer((layer: any) => {
        const districtName = layer.feature.properties.name || layer.feature.properties.NAME_1 || "";
        layer.setStyle({
          fillColor: getFillColor(districtName)
        });
      });
    }
  }, [weeklyData]);

  return (
    <div className="w-full h-full relative min-h-[550px] bg-[#09090b]">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full rounded-xl overflow-hidden" />
    </div>
  );
}