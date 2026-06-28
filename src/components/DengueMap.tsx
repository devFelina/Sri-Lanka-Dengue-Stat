import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DengueMapProps {
  weeklyData: any;
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

export default function DengueMap({ weeklyData, onDistrictSelect }: DengueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const getFillColor = (geoName: string) => {
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
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const mapInstance = L.map(mapContainerRef.current, {
      center: [7.8731, 80.7718],
      zoom: 7.2,
      minZoom: 6.5, 
      maxZoom: 10,
      maxBounds: SRI_LANKA_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      attributionControl: false
    });

    mapRef.current = mapInstance;

    setTimeout(() => {
      if (mapInstance) mapInstance.invalidateSize();
    }, 250);

    const basePath = import.meta.env.BASE_URL;
    fetch(`${basePath}data/lk.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((geoData) => {
        if (!mapRef.current || !mapContainerRef.current) return;

        const geoLayer = L.geoJSON(geoData, {
          style: (feature: any) => {
            const rawName = feature.properties?.name || feature.properties?.NAME_1 || feature.properties?.district || "";
            return {
              fillColor: getFillColor(rawName),
              weight: 1.5,
              opacity: 1,
              color: '#09090b',
              fillOpacity: 0.85,
            };
          },
          onEachFeature: (feature, layer) => {
            const rawName = feature.properties?.name || feature.properties?.NAME_1 || feature.properties?.district || "";
            const cleanedRawName = rawName.replace(/district/gi, '').trim();
            const correctedName = districtNameMap[cleanedRawName] || cleanedRawName;
            
            layer.on({
              click: () => onDistrictSelect(correctedName),
              mouseover: (e) => e.target.setStyle({ weight: 2.5, color: '#ffffff', fillOpacity: 0.95 }),
              mouseout: (e) => {
                if (geoJsonLayerRef.current) geoJsonLayerRef.current.resetStyle(e.target);
              }
            });
          }
        });

        if (!mapRef.current) return;

        geoLayer.addTo(mapRef.current);
        geoJsonLayerRef.current = geoLayer;

        const bounds = geoLayer.getBounds();
        if (bounds.isValid() && mapRef.current) {
          mapRef.current.fitBounds(bounds, { padding: [15, 15] });
        }
      })
      .catch((err) => console.error("Error drawing unified lk.json geographic vectors:", err));

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update fill styles dynamically when sliding across weekly intervals
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.eachLayer((layer: any) => {
        if (layer.feature && layer.feature.properties) {
          const districtName = layer.feature.properties.name || layer.feature.properties.NAME_1 || layer.feature.properties.district || "";
          layer.setStyle({
            fillColor: getFillColor(districtName)
          });
        }
      });
    }
  }, [weeklyData]);

  return (
    <div className="w-full h-full relative min-h-[550px] bg-[#09090b]">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full rounded-xl overflow-hidden" />
    </div>
  );
}