import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ComparisonMapProps {
  leftWeeklyData: any;
  rightWeeklyData: any;
  onDistrictSelect: (name: string) => void;
}

const districtNameMap: Record<string, string> = {
  "Ampara": "Ampara", "Anuradhapura": "Anuradhapura", "Badulla": "Badulla",
  "Batticaloa": "Batticaloa", "Colombo": "Colombo", "Galle": "Galle",
  "Gampaha": "Gampaha", "Hambantota": "Hambantota", "Jaffna": "Jaffna",
  "Kalutara": "Kalutara", "Kandy": "Kandy", "Kegalle": "Kegalle",
  "Kilinochchi": "Kilinochchi", "Kurunegala": "Kurunegala", "Mannar": "Mannar",
  "Matale": "Matale", "Matara": "Matara", "Moneragala": "Moneragala", "Monaragala": "Moneragala",
  "Mullaitivu": "Mullaitivu", "Nuwara Eliya": "Nuwara Eliya", "Nuwaraeliya": "Nuwara Eliya",
  "Polonnaruwa": "Polonnaruwa", "Puttalam": "Puttalam", 
  "Ratnapura": "Ratnapura", "Trincomalee": "Trincomalee", "Vavuniya": "Vavuniya"
};

const SRI_LANKA_BOUNDS = L.latLngBounds(L.latLng(5.4, 79.0), L.latLng(10.2, 82.4));

export default function ComparisonMap({ leftWeeklyData, rightWeeklyData, onDistrictSelect }: ComparisonMapProps) {
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const rightContainerRef = useRef<HTMLDivElement>(null);
  
  const leftMapRef = useRef<L.Map | null>(null);
  const rightMapRef = useRef<L.Map | null>(null);
  
  const leftGeoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const rightGeoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const getFillColor = (geoName: string, weeklyData: any) => {
    if (!weeklyData || !weeklyData.districts) return '#1c1c1e';
    const cleanedGeoName = geoName.replace(/district/gi, '').trim().toLowerCase();
    
    let matchedKey = Object.keys(weeklyData.districts).find((key) => {
      const cleanedKey = (districtNameMap[key] || key).replace(/district/gi, '').trim().toLowerCase();
      return cleanedKey === cleanedGeoName;
    });

    if (!matchedKey && cleanedGeoName === 'ampara' && weeklyData.districts['Kalmunai']) {
      matchedKey = 'Kalmunai';
    }

    if (!matchedKey || !weeklyData.districts[matchedKey]) return '#27272a';

    const cases = weeklyData.districts[matchedKey].cases;
    if (cases >= 20) return '#ef4444'; 
    if (cases >= 10) return '#f97316'; 
    if (cases > 0)   return '#eab308'; 
    return '#3f3f46';                  
  };

  useEffect(() => {
    if (!leftContainerRef.current || !rightContainerRef.current) return;

    const leftMap = L.map(leftContainerRef.current, {
      center: [7.8731, 80.7718],
      zoom: 6.8,
      minZoom: 6.0,
      maxZoom: 10,
      maxBounds: SRI_LANKA_BOUNDS,
      maxBoundsViscosity: 1.0,
      attributionControl: false
    });

    const rightMap = L.map(rightContainerRef.current, {
      center: [7.8731, 80.7718],
      zoom: 6.8,
      minZoom: 6.0,
      maxZoom: 10,
      maxBounds: SRI_LANKA_BOUNDS,
      maxBoundsViscosity: 1.0,
      attributionControl: false,
      zoomControl: false 
    });

    leftMapRef.current = leftMap;
    rightMapRef.current = rightMap;

    // ✨ Tab Navigation Map Invalidation Helper Fix
    setTimeout(() => {
      if (leftMap) leftMap.invalidateSize();
      if (rightMap) rightMap.invalidateSize();
    }, 100);

    let isSyncing = false;
    leftMap.on('move', () => {
      if (!isSyncing && rightMap) {
        isSyncing = true;
        rightMap.setView(leftMap.getCenter(), leftMap.getZoom(), { animate: false });
        isSyncing = false;
      }
    });

    rightMap.on('move', () => {
      if (!isSyncing && leftMap) {
        isSyncing = true;
        leftMap.setView(rightMap.getCenter(), rightMap.getZoom(), { animate: false });
        isSyncing = false;
      }
    });

    const basePath = import.meta.env.BASE_URL;
    fetch(`${basePath}data/lk.json`)
      .then((res) => res.json())
      .then((geoData) => {
        const leftLayer = L.geoJSON(geoData, {
          style: (feature: any) => ({
            fillColor: getFillColor(feature.properties?.name || "", leftWeeklyData),
            weight: 1.2,
            opacity: 1,
            color: '#09090b',
            fillOpacity: 0.85,
          }),
          onEachFeature: (feature, layer) => {
            const rawName = feature.properties?.name || "";
            const cleaned = rawName.replace(/district/gi, '').trim();
            const correctedName = districtNameMap[cleaned] || cleaned;
            layer.on({
              click: () => onDistrictSelect(correctedName),
              mouseover: (e) => e.target.setStyle({ weight: 2.5, color: '#ffffff' }),
              mouseout: (e) => { if (leftGeoJsonLayerRef.current) leftGeoJsonLayerRef.current.resetStyle(e.target); }
            });
          }
        }).addTo(leftMap);

        const rightLayer = L.geoJSON(geoData, {
          style: (feature: any) => ({
            fillColor: getFillColor(feature.properties?.name || "", rightWeeklyData),
            weight: 1.2,
            opacity: 1,
            color: '#09090b',
            fillOpacity: 0.85,
          }),
          onEachFeature: (feature, layer) => {
            const rawName = feature.properties?.name || "";
            const cleaned = rawName.replace(/district/gi, '').trim();
            const correctedName = districtNameMap[cleaned] || cleaned;
            layer.on({
              click: () => onDistrictSelect(correctedName),
              mouseover: (e) => e.target.setStyle({ weight: 2.5, color: '#ffffff' }),
              mouseout: (e) => { if (rightGeoJsonLayerRef.current) rightGeoJsonLayerRef.current.resetStyle(e.target); }
            });
          }
        }).addTo(rightMap);

        leftGeoJsonLayerRef.current = leftLayer;
        rightGeoJsonLayerRef.current = rightLayer;
      })
      .catch((err) => console.error("Error drawing unified comparative framework:", err));

    return () => {
      if (leftMapRef.current) leftMapRef.current.remove();
      if (rightMapRef.current) rightMapRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (leftGeoJsonLayerRef.current) {
      leftGeoJsonLayerRef.current.eachLayer((layer: any) => {
        const dName = layer.feature.properties?.name || "";
        layer.setStyle({ fillColor: getFillColor(dName, leftWeeklyData) });
      });
    }
  }, [leftWeeklyData]);

  useEffect(() => {
    if (rightGeoJsonLayerRef.current) {
      rightGeoJsonLayerRef.current.eachLayer((layer: any) => {
        const dName = layer.feature.properties?.name || "";
        layer.setStyle({ fillColor: getFillColor(dName, rightWeeklyData) });
      });
    }
  }, [rightWeeklyData]);

  return (
    <div className="w-full h-full grid grid-cols-2 gap-4 bg-[#09090b] p-2 min-h-[550px]">
      <div className="relative border border-zinc-800 rounded-xl overflow-hidden">
        <div ref={leftContainerRef} className="absolute inset-0 w-full h-full" />
      </div>
      <div className="relative border border-zinc-800 rounded-xl overflow-hidden">
        <div ref={rightContainerRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
}