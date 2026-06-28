import { useEffect, useState } from 'react';
import DengueMap from './components/DengueMap';
import ComparisonMap from './components/ComparisonMap';
import type { DengueTimeSeriesDataset } from './types/dengue';

export default function App() {
  const [dataset, setDataset] = useState<DengueTimeSeriesDataset | null>(null);
  const [timelineKeys, setTimelineKeys] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<'single' | 'comparison'>('single');
  const [activeIndex, setActiveIndex] = useState<number>(0); 
  const [leftIndex, setLeftIndex] = useState<number>(0);       
  const [rightIndex, setRightIndex] = useState<number>(0);     
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const basePath = import.meta.env.BASE_URL;
        const dataRes = await fetch(`${basePath}data/dengue_map_data.json`);
        if (!dataRes.ok) throw new Error(`HTTP Error Status: ${dataRes.status}`);
        
        const mapData: DengueTimeSeriesDataset = await dataRes.json();
        const sortedKeys = Object.keys(mapData).sort();
        setDataset(mapData);
        setTimelineKeys(sortedKeys);
        setActiveIndex(sortedKeys.length - 1); 
        setLeftIndex(0);
        setRightIndex(sortedKeys.length > 1 ? 1 : 0);
        setLoading(false);
      } catch (err) {
        console.error("Critical error loading analytics data vectors:", err);
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col justify-center items-center text-[#f5f5f7] gap-4">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-1 w-24 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#ffffff] w-1/2 rounded-full" />
          </div>
          <p className="text-xs font-mono tracking-[0.2em] text-zinc-500 uppercase">SYS_INTELLIGENCE_INIT</p>
        </div>
      </div>
    );
  }

  const activeDate = timelineKeys[activeIndex];
  const leftDate = timelineKeys[leftIndex];
  const rightDate = timelineKeys[rightIndex];

  const activeWeeklyPayload = dataset && activeDate ? dataset[activeDate] : undefined;
  const leftPayload = dataset && leftDate ? dataset[leftDate] : undefined;
  const rightPayload = dataset && rightDate ? dataset[rightDate] : undefined;

  const getMetricsForSide = (payload: any) => {
    if (!payload || !selectedDistrict) return undefined;
    const cleanSelected = selectedDistrict.toLowerCase().replace(/district/g, '').trim();
    const targetKey = Object.keys(payload.districts).find(k => k.toLowerCase().replace(/district/g, '').trim() === cleanSelected);
    return targetKey ? payload.districts[targetKey] : undefined;
  };

  const singleMetrics = getMetricsForSide(activeWeeklyPayload);
  const leftMetrics = getMetricsForSide(leftPayload);
  const rightMetrics = getMetricsForSide(rightPayload);

  const caseDelta = leftMetrics && rightMetrics ? rightMetrics.cases - leftMetrics.cases : 0;
  const rainDelta = leftMetrics && rightMetrics ? parseFloat((rightMetrics.rain - leftMetrics.rain).toFixed(1)) : 0;
  const tempDelta = leftMetrics && rightMetrics ? parseFloat((rightMetrics.temp - leftMetrics.temp).toFixed(1)) : 0;
  const humidDelta = leftMetrics && rightMetrics ? parseFloat((rightMetrics.humidity - leftMetrics.humidity).toFixed(1)) : 0;

  // 🚨 RISK STATUS BADGES
  const getRiskBadge = (cases: number) => {
    if (cases >= 50) return { text: "🚨 HIGH RISK OUTBREAK", style: "bg-red-950/50 text-red-400 border-red-800/60" };
    if (cases >= 21) return { text: "⚠️ MODERATE RISK", style: "bg-orange-950/50 text-orange-400 border-orange-800/60" };
    if (cases >= 1) return { text: "🌱 LOW ACTIVE", style: "bg-yellow-950/40 text-yellow-500 border-yellow-800/40" };
    return { text: "🟢 NO ACTIVE CASES", style: "bg-zinc-900 text-zinc-400 border-zinc-800" };
  };

  // 📝 SMART INTUITION TRANSLATIONS
  const getSingleRainText = (rain: number) => {
    if (rain === 0) return "Dry weather window. Local puddles are evaporating; natural outdoor mosquito breeding zones are actively shrinking.";
    if (rain > 40) return "Severe precipitation peak. Risk of localized flash flooding; outdoor containers are filled, creating highly dynamic breeding vectors.";
    return "Moderate rainy conditions. Steady accumulation of clean, standing freshwater pools ideal for Aedes egg propagation lifecycle.";
  };

  const getSingleTempText = (temp: number) => {
    if (temp >= 24) return "Optimal breeding climate. Warm weather speeds up the mosquito egg incubation and virus replication cycles.";
    return "Sub-optimal development temperatures. Vector metabolic acceleration rate reduces, marginally dragging incubation windows out longer.";
  };

  const getSingleHumidText = (humidity: number) => {
    if (humidity >= 75) return "Elevated moisture conditions. High humidity extends adult mosquito lifespan, expanding their operational flying and biting windows.";
    return "Drier climate window. Lower moisture index levels cause adult insects to dehydrate faster, minimizing flight distance.";
  };

  const getCaseDescription = (val: number) => {
    if (val > 25) return "🚨 Major Outbreak Spike";
    if (val > 0) return "⚠️ Increasing Vector Count";
    if (val < -25) return "📉 Rapid Containment Drop";
    if (val < 0) return "✅ Contracting Infection Rates";
    return "➡️ No Epidemic Change";
  };

  // 📊 GENERATE HISTORICAL POINTS FOR THE TREND LINE CHART (Selected District across all loaded timeline blocks)
  const getChartTimelineData = () => {
    if (!dataset || !selectedDistrict) return [];
    const cleanSelected = selectedDistrict.toLowerCase().replace(/district/g, '').trim();
    
    return timelineKeys.map(date => {
      const payload = dataset[date];
      const targetKey = Object.keys(payload.districts).find(k => k.toLowerCase().replace(/district/g, '').trim() === cleanSelected);
      const metrics = targetKey ? payload.districts[targetKey] : { cases: 0, rain: 0 };
      return { date, cases: metrics.cases, rain: metrics.rain };
    });
  };

  const chartData = getChartTimelineData();
  const maxChartCases = chartData.length > 0 ? Math.max(...chartData.map(d => d.cases), 10) : 10;

  // 🗂️ GENERATE LIST FOR THE DATATABLE LEDGER (Sorted descending by active dataset parameters)
  const getTableDataList = () => {
    if (!activeWeeklyPayload) return [];
    return Object.entries(activeWeeklyPayload.districts).map(([name, data]: [string, any]) => ({
      name,
      cases: data.cases,
      cumulative: data.cumulative,
      rain: data.rain,
      temp: data.temp,
      humidity: data.humidity
    })).sort((a, b) => b.cases - a.cases); // Sort highest risk first
  };

  const tableDataList = getTableDataList();

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col antialiased selection:bg-zinc-800">
      
      {/* HEADER CONTROLS */}
      <header className="sticky top-0 z-[1000] bg-[#000000]/70 backdrop-blur-md border-b border-[#1c1c1e] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">Epidemic Intelligence</h1>
          <p className="text-xs text-zinc-500 font-mono tracking-wide">Sri Lanka — Vector Surveillance Node</p>
        </div>
        
        <div className="flex items-center bg-[#1c1c1e] border border-zinc-800 p-1 rounded-xl shadow-sm">
          <button 
            onClick={() => setCurrentTab('single')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'single' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            📊 Surveillance Map
          </button>
          <button 
            onClick={() => setCurrentTab('comparison')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'comparison' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            🔄 Comparison View
          </button>
        </div>
      </header>

      {/* CORE FRAMEWORK INTERFACE */}
      <main className="max-w-[1700px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        
        {/* LEFT COLUMN COMPOSITE CONTAINER: VISUAL MAPS + TIMELINE + CHARTS & TABLES */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* MAP CANVAS PANEL */}
          <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800/50 p-4 flex flex-col gap-4 shadow-2xl">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Spatiotemporal Data Projections</h2>
              <span className="text-xs font-mono text-zinc-500">
                {currentTab === 'single' ? `Active Target: ${activeDate}` : 'Dual Sync Active'}
              </span>
            </div>

            <div className="h-[520px] relative rounded-xl overflow-hidden border border-zinc-800 bg-[#09090b]">
              {currentTab === 'single' ? (
                <DengueMap weeklyData={activeWeeklyPayload} onDistrictSelect={setSelectedDistrict} />
              ) : (
                <ComparisonMap leftWeeklyData={leftPayload} rightWeeklyData={rightPayload} onDistrictSelect={setSelectedDistrict} />
              )}

              {/* FLOATING MAP LEGEND */}
              <div className="absolute bottom-4 right-4 bg-[#1c1c1e]/90 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-xl z-[999] max-w-[220px] space-y-2">
                <p className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase font-mono">Weekly Case Range Key</p>
                <div className="space-y-1.5 text-[10px] font-mono">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" /> <span className="text-zinc-300">&ge; 50 (High Danger)</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#f97316]" /> <span className="text-zinc-300">21 - 49 (Moderate)</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#eab308]" /> <span className="text-zinc-300">1 - 20 (Low Active)</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#3f3f46]" /> <span className="text-zinc-500">0 Active Cases</span></div>
                </div>
              </div>
            </div>

            {/* LOWER TIMELINE CONTROLLER */}
            <div className="bg-[#09090b] border border-zinc-800/80 rounded-xl p-4">
              {currentTab === 'single' ? (
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px] text-zinc-500 uppercase">
                    <span>Timeline Viewport Slider</span>
                    <span className="text-white font-bold">{activeDate}</span>
                  </div>
                  <input 
                    type="range" min={0} max={timelineKeys.length - 1} value={activeIndex}
                    onChange={(e) => setActiveIndex(parseInt(e.target.value, 10))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px] text-zinc-500 uppercase">
                      <span>Baseline Checkpoint (Left Map)</span>
                      <span className="text-zinc-400">{leftDate}</span>
                    </div>
                    <input type="range" min={0} max={timelineKeys.length - 1} value={leftIndex} onChange={(e) => setLeftIndex(parseInt(e.target.value, 10))} className="w-full accent-zinc-400 cursor-pointer" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px] text-zinc-500 uppercase">
                      <span>Comparison Viewport (Right Map)</span>
                      <span className="text-white">{rightDate}</span>
                    </div>
                    <input type="range" min={0} max={timelineKeys.length - 1} value={rightIndex} onChange={(e) => setRightIndex(parseInt(e.target.value, 10))} className="w-full accent-white cursor-pointer" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 📈 NEW COMPONENT 1: HISTORICAL TREND LINE CHART PANEL */}
          <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800/50 p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Temporal Trend Comparison Line Chart</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Historical distribution curves over available dataset logs.</p>
              </div>
              {selectedDistrict && (
                <span className="text-xs font-mono px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white font-bold">{selectedDistrict}</span>
              )}
            </div>

            {!selectedDistrict ? (
              <div className="text-center py-12 text-zinc-500 text-xs italic">Select a district region above to build timeline vector charts.</div>
            ) : (
              <div className="space-y-2">
                {/* SVG Line Chart Workspace */}
                <div className="h-44 w-full bg-[#09090b] rounded-xl border border-zinc-800/80 relative p-4 flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 100" preserveAspectRatio="none">
                    {/* Grid Background Lines */}
                    <line x1="0" y1="25" x2="600" y2="25" stroke="#1c1c1e" strokeWidth="0.5" strokeDasharray="4" />
                    <line x1="0" y1="50" x2="600" y2="50" stroke="#1c1c1e" strokeWidth="0.5" strokeDasharray="4" />
                    <line x1="0" y1="75" x2="600" y2="75" stroke="#1c1c1e" strokeWidth="0.5" strokeDasharray="4" />
                    
                    {/* Sparkline Plot Curve for Case Trajectory */}
                    <polyline
                      fill="none" stroke="#ef4444" strokeWidth="2"
                      points={chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1 || 1)) * 600;
                        const y = 100 - (d.cases / maxChartCases) * 100;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  </svg>
                  
                  {/* Axis Label Elements */}
                  <div className="absolute top-2 left-2 text-[8px] font-mono text-zinc-600">Peak Volume Value: {maxChartCases} Cases</div>
                  <div className="absolute bottom-1 left-2 text-[8px] font-mono text-zinc-600">Timeline Start ({chartData[0]?.date})</div>
                  <div className="absolute bottom-1 right-2 text-[8px] font-mono text-zinc-600">Timeline Terminal ({chartData[chartData.length - 1]?.date})</div>
                </div>
                <div className="flex items-center gap-4 px-1 text-[10px] font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 block"/> Weekly Disease Outbreak Curve</div>
                </div>
              </div>
            )}
          </div>

          {/* 🗂️ NEW COMPONENT 2: DISTRICT METRICS DATATABLE LEDGER */}
          <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800/50 p-5 shadow-2xl flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Tabular Metrics Ledger</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Comprehensive regional database ledger sorted by highest case counts.</p>
            </div>

            <div className="overflow-x-auto border border-zinc-800 rounded-xl bg-[#09090b]">
              <table className="w-full text-left border-collapse font-mono text-xs text-zinc-400">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-3">District Entity Name</th>
                    <th className="p-3 text-right text-red-400">Weekly Cases</th>
                    <th className="p-3 text-right">Cumulative Vector</th>
                    <th className="p-3 text-right text-blue-400">Rainfall Volume</th>
                    <th className="p-3 text-right text-amber-500">Thermal Mean</th>
                    <th className="p-3 text-right text-emerald-400">Rel Humidity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {tableDataList.map((item) => (
                    <tr 
                      key={item.name} 
                      onClick={() => setSelectedDistrict(item.name)}
                      className={`hover:bg-zinc-900/50 cursor-pointer transition-colors ${selectedDistrict === item.name ? 'bg-zinc-900 text-white' : ''}`}
                    >
                      <td className="p-3 font-semibold text-zinc-200">{item.name}</td>
                      <td className="p-3 text-right font-bold text-red-500">{item.cases}</td>
                      <td className="p-3 text-right text-zinc-400">{item.cumulative}</td>
                      <td className="p-3 text-right text-blue-400">{item.rain} mm</td>
                      <td className="p-3 text-right text-amber-500">{item.temp} °C</td>
                      <td className="p-3 text-right text-emerald-400">{item.humidity}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT ANALYTICS READING CONSOLE PANEL */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800/50 p-5 flex flex-col gap-5 shadow-2xl sticky top-24">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              {currentTab === 'single' ? 'Regional Analytics Vector' : 'Delta Shift Assessment'}
            </h3>
            
            {!selectedDistrict ? (
              <div className="text-center py-28 text-zinc-500 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-xs">▫️</div>
                <p className="text-xs font-light max-w-[200px] leading-relaxed">Select any district polygon on the active map display or table to view detailed insights.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                
                {/* DISTRICT HEADLINE WITH RISK BADGE */}
                <div className="border-b border-zinc-800 pb-3 space-y-2">
                  <h4 className="text-2xl font-semibold tracking-tight text-white">{selectedDistrict}</h4>
                  {currentTab === 'single' && singleMetrics && (
                    <div className={`inline-block px-2.5 py-0.5 text-[9px] font-bold font-mono tracking-wider rounded border ${getRiskBadge(singleMetrics.cases).style}`}>
                      {getRiskBadge(singleMetrics.cases).text}
                    </div>
                  )}
                </div>

                {/* TAB WINDOW 1: STANDARD CLIMATE & INSIGHTS */}
                {currentTab === 'single' && singleMetrics ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#09090b] border border-zinc-800/60 p-4 rounded-xl">
                        <span className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-1">New Cases This Week</span>
                        <span className="text-3xl font-light text-white tracking-tight">{singleMetrics.cases}</span>
                      </div>
                      <div className="bg-[#09090b] border border-zinc-800/60 p-4 rounded-xl">
                        <span className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-1">Total Cases This Year</span>
                        <span className="text-2xl font-light text-zinc-400 tracking-tight">{singleMetrics.cumulative}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Environmental Risk Metrics:</h5>
                      
                      {/* RAINFALL */}
                      <div className="bg-[#09090b] border border-zinc-800/60 p-3.5 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-xs text-zinc-300 font-mono">
                          <span>🌧️ Weekly Rainfall</span>
                          <span className="text-white font-bold">{singleMetrics.rain} mm</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-light">{getSingleRainText(singleMetrics.rain)}</p>
                      </div>

                      {/* TEMPERATURE */}
                      <div className="bg-[#09090b] border border-zinc-800/60 p-3.5 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-xs text-zinc-300 font-mono">
                          <span>⚗️ Average Temperature</span>
                          <span className="text-white font-bold">{singleMetrics.temp} °C</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-light">{getSingleTempText(singleMetrics.temp)}</p>
                      </div>

                      {/* HUMIDITY */}
                      <div className="bg-[#09090b] border border-zinc-800/60 p-3.5 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-xs text-zinc-300 font-mono">
                          <span>💧 Air Moisture (Humidity)</span>
                          <span className="text-white font-bold">{singleMetrics.humidity}%</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-light">{getSingleHumidText(singleMetrics.humidity)}</p>
                      </div>
                    </div>
                  </div>
                ) : currentTab === 'comparison' && leftMetrics && rightMetrics ? (
                  
                  // TAB WINDOW 2: DELTA COMPARISON TRANSLATIONS
                  <div className="space-y-4">
                    
                    {/* CASE DELTA TREND */}
                    <div className="bg-[#09090b] border border-zinc-800/60 p-4 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">Case Delta Trend</span>
                        <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          {caseDelta > 0 ? `+${caseDelta}` : caseDelta}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white tracking-tight">{getCaseDescription(caseDelta)}</p>
                      <p className="text-[10px] font-mono text-zinc-500">{leftMetrics.cases} &rarr; {rightMetrics.cases} cases</p>
                    </div>

                    {/* RAINFALL SHIFT */}
                    <div className="bg-[#09090b] border border-zinc-800/60 p-4 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">Rainfall Shift</span>
                        <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/40">
                          {rainDelta > 0 ? `+${rainDelta} mm` : `${rainDelta} mm`}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-500">{leftMetrics.rain}mm &rarr; {rightMetrics.rain}mm</p>
                    </div>

                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic py-4 text-center">Data ranges missing or partial.</p>
                )}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}