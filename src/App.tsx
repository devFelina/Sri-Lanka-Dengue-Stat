import { useEffect, useState } from 'react';
import DengueMap from './components/DengueMap';
import type { DengueTimeSeriesDataset } from './types/dengue';

export default function App() {
  const [dataset, setDataset] = useState<DengueTimeSeriesDataset | null>(null);
  const [timelineKeys, setTimelineKeys] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const dataRes = await fetch('/data/dengue_map_data.json');
        const mapData: DengueTimeSeriesDataset = await dataRes.json();

        const sortedKeys = Object.keys(mapData).sort();
        
        setDataset(mapData);
        setTimelineKeys(sortedKeys);
        setLoading(false);
      } catch (err) {
        console.error("Critical error loading analytics data vectors:", err);
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const getMonsoonAdvisory = () => {
    if (!activeDate) return "System calculating temporal coordinates...";
    const month = parseInt(activeDate.split('-')[1], 10);
    if (month >= 5 && month <= 9) {
      return "Southwest Monsoon active. Wet-zone coordinates are experiencing peak vector lifecycle acceleration. Priority source reduction protocols recommended.";
    } else if (month === 12 || month === 1 || month === 2) {
      return "Northeast Monsoon active. Epidemic transmission variance widening along Eastern and Northern dry-zone borders.";
    }
    return "Inter-monsoon stabilization window. Optimal phase for regional structural canal restoration and preventative source elimination.";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col justify-center items-center text-[#f5f5f7] gap-4">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-1 w-24 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#ffffff] w-1/2 rounded-full" />
          </div>
          <p className="text-xs font-mono tracking-[0.2em] text-zinc-500 uppercase">SYS_HYDRATION_ACTIVE</p>
        </div>
      </div>
    );
  }

  const activeDate = timelineKeys[activeIndex];
  const activeWeeklyPayload = dataset && activeDate ? dataset[activeDate] : undefined;

  const activeDistrictMetrics = (() => {
    if (!activeWeeklyPayload || !selectedDistrict) return undefined;
    
    const cleanSelected = selectedDistrict.toLowerCase().replace(/district/g, '').trim();
    
    const targetKey = Object.keys(activeWeeklyPayload.districts).find((k) => {
      const cleanKey = k.toLowerCase().replace(/district/g, '').trim();
      return cleanKey === cleanSelected;
    });
    
    return targetKey ? activeWeeklyPayload.districts[targetKey] : undefined;
  })();

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col antialiased selection:bg-zinc-800">
      
      <header className="sticky top-0 z-[1000] bg-[#000000]/70 backdrop-blur-md border-b border-[#1c1c1e] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">Epidemic Intelligence</h1>
          <p className="text-xs text-zinc-500 font-mono tracking-wide">Sri Lanka — Vector Surveillance Node</p>
        </div>
        <div className="flex items-center gap-4">
          {activeWeeklyPayload && (
            <div className="bg-[#1c1c1e] border border-zinc-800 text-[#f5f5f7] font-mono text-xs px-3 py-1 rounded-full shadow-sm">
              {activeDate} ── {activeWeeklyPayload.end_date}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        
        {/* Left Side: Map Dashboard Container */}
        <div className="lg:col-span-3 bg-[#1c1c1e] rounded-2xl border border-zinc-800/50 p-4 flex flex-col justify-between gap-4 shadow-2xl">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Spatiotemporal Data Projections</h2>
            <span className="text-xs font-mono text-zinc-500">
              Index T-{activeIndex + 1}/{timelineKeys.length}
            </span>
          </div>

          <div className="flex-1 min-h-[550px] relative rounded-xl overflow-hidden border border-zinc-800 bg-[#09090b]">
            <DengueMap 
              weeklyData={activeWeeklyPayload}
              onDistrictSelect={setSelectedDistrict}
            />
          </div>

          <div className="bg-[#09090b] border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-2">
            <input 
              type="range" 
              id="timeline-range"
              min={0} 
              max={timelineKeys.length - 1} 
              value={activeIndex}
              onChange={(e) => setActiveIndex(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right Side: Analytical Console Readouts */}
        <div className="flex flex-col gap-6">
          
          {/* ✅ UPDATED AREA: Human-friendly District Health Profile Panel */}
          <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800/50 p-5 flex flex-col gap-5 shadow-2xl">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Regional Analytics Vector</h3>
            
            {!selectedDistrict ? (
              <div className="text-center py-20 text-zinc-500 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-xs">▫️</div>
                <p className="text-xs font-light max-w-[200px] leading-relaxed">Select a district region on the map display viewport to run calculations</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-baseline border-b border-zinc-800 pb-3">
                  <h4 className="text-2xl font-semibold tracking-tight text-white">{selectedDistrict}</h4>
                  {activeDistrictMetrics && (
                    <span className={`text-xs font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full font-bold ${
                      activeDistrictMetrics.cases >= 20 ? 'bg-red-950 text-red-400 border border-red-900' :
                      activeDistrictMetrics.cases >= 10 ? 'bg-orange-950 text-orange-400 border border-orange-900' :
                      activeDistrictMetrics.cases > 0 ? 'bg-yellow-950 text-yellow-400 border border-yellow-900' :
                      'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}>
                      {activeDistrictMetrics.cases >= 20 ? '🔥 High Outbreak' :
                       activeDistrictMetrics.cases >= 10 ? '⚠️ Warning Phase' :
                       activeDistrictMetrics.cases > 0 ? '🌱 Low Active' : '🛡️ Safe Baseline'}
                    </span>
                  )}
                </div>

                {activeDistrictMetrics ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#09090b] border border-zinc-800/60 p-4 rounded-xl">
                        <span className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-1">New Cases This Week</span>
                        <span className="text-3xl font-light text-white tracking-tight">{activeDistrictMetrics.cases}</span>
                      </div>
                      <div className="bg-[#09090b] border border-zinc-800/60 p-4 rounded-xl">
                        <span className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-1">Total Cases This Year</span>
                        <span className="text-2xl font-light text-zinc-400 tracking-tight">{activeDistrictMetrics.cumulative}</span>
                      </div>
                    </div>

                    {/* Translating numbers into plain explanation cards */}
                    <div className="space-y-3 mt-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400">Environmental Risk Metrics:</h4>
                      
                      <div className="bg-[#09090b] border border-zinc-800/60 rounded-xl p-4 space-y-4">
                        
                        {/* Weather - Rainfall Translation */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400 font-medium">🌧️ Weekly Rainfall</span>
                            <span className="text-white font-mono font-bold">{activeDistrictMetrics.rain} mm</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
                            {activeDistrictMetrics.rain >= 50 ? "Heavy monsoonal rains. Warning: High risk of instant water accumulation in artificial trash or open roofs." :
                             activeDistrictMetrics.rain >= 10 ? "Moderate rainfall. Provides perfect fresh water conditions for outdoor breeding pools and puddles to expand." :
                             activeDistrictMetrics.rain > 0 ? "Light passing showers. Supplies minor moisture pockets without flushing early mosquito eggs away." :
                             "Dry weather window. Local puddles are evaporating; natural outdoor mosquito breeding zones are actively shrinking."}
                          </p>
                        </div>

                        {/* Weather - Temperature Translation */}
                        <div className="flex flex-col gap-1 border-t border-zinc-900 pt-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400 font-medium">🌡️ Average Temperature</span>
                            <span className="text-white font-mono font-bold">{activeDistrictMetrics.temp} °C</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
                            {activeDistrictMetrics.temp >= 22 && activeDistrictMetrics.temp <= 29 ? "Optimal breeding climate. Warm weather speeds up the mosquito egg incubation and virus replication cycles." :
                             activeDistrictMetrics.temp > 29 ? "Extreme heat indexes. High heat patterns limit the overall life span of adult mosquitoes." :
                             "Cooler conditions. Low air temperature naturally slows down virus development rates inside the insect vector."}
                          </p>
                        </div>

                        {/* Weather - Humidity Translation */}
                        <div className="flex flex-col gap-1 border-t border-zinc-900 pt-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400 font-medium">💧 Air Moisture (Humidity)</span>
                            <span className="text-white font-mono font-bold">{activeDistrictMetrics.humidity}%</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
                            {activeDistrictMetrics.humidity >= 75 ? "Saturated, humid air environment. Keeps adult mosquitoes highly active, hydrated, and breeding for longer periods." :
                             "Drier climate window. Lower moisture index levels cause adult insects to dehydrate faster, minimizing flight distance."}
                          </p>
                        </div>

                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-zinc-500 italic py-4 text-center">Temporal logs matching these data matrices are blank.</p>
                )}
              </div>
            )}
          </div>

          {/* Module Environmental console alerts */}
          <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800/50 p-5 flex flex-col gap-3 shadow-2xl">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Environmental Advisory Module</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light bg-[#09090b] border border-zinc-800/60 p-4 rounded-xl">
              {getMonsoonAdvisory()}
            </p>
          </div>

          {/* Scale Legend */}
          <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800/50 p-4 shadow-2xl">
            <div className="flex justify-between text-[10px] font-mono tracking-wider text-zinc-500 mb-2">
              <span>01 / BASELINE</span>
              <span>02 / EPIDEMIC</span>
            </div>
            <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-zinc-900 mb-2 shadow-inner">
              <div className="bg-zinc-700 flex-1" />
              <div className="bg-yellow-500/80 flex-1" />
              <div className="bg-orange-500/80 flex-1" />
              <div className="bg-red-500/90 flex-1" />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}