import { useMemo, useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, SlidersHorizontal, Trash2 } from "lucide-react";

import DistrictComparisonTable from "../components/dashboard/DistrictComparisonTable";
import WeeklyComparisonChart from "../components/dashboard/WeeklyComparisonChart";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import ComparisonMap from "../components/map/ComparisonMap";
import { useDengueData } from "../hooks/useDengueData";
import { getWeeklyPayload } from "../utils/dengueStats";

function formatWeekLabel(endDate: string) {
  return new Date(endDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Compare() {
  const { data, geoJson, timelineKeys, loading, error } = useDengueData();
  const [weekAKey, setWeekAKey] = useState("");
  const [weekBKey, setWeekBKey] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const defaultA = timelineKeys[timelineKeys.length - 2] ?? "";
  const defaultB = timelineKeys[timelineKeys.length - 1] ?? "";

  const activeWeekA = weekAKey || defaultA;
  const activeWeekB = weekBKey || defaultB;

  const weekA = useMemo(() => {
    if (!data || !activeWeekA) {
      return null;
    }
    return getWeeklyPayload(data, activeWeekA);
  }, [data, activeWeekA]);

  const weekB = useMemo(() => {
    if (!data || !activeWeekB) {
      return null;
    }
    return getWeeklyPayload(data, activeWeekB);
  }, [data, activeWeekB]);

  const labelA = weekA ? formatWeekLabel(weekA.end_date) : "Week A";
  const labelB = weekB ? formatWeekLabel(weekB.end_date) : "Week B";

  const allDistricts = useMemo(() => {
    if (!weekA) return [];
    return Object.keys(weekA.districts).sort();
  }, [weekA]);

  const filteredDistricts = useMemo(() => {
    return allDistricts.filter((d) =>
      d.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allDistricts, searchTerm]);

  const handleDistrictToggle = (districtName: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(districtName)
        ? prev.filter((d) => d !== districtName)
        : [...prev, districtName]
    );
  };

  const handleClearAll = () => {
    setSelectedDistricts([]);
  };

  return (
    <>
      <Header currentPage="compare" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-zinc-100">
            Compare Weeks & Districts
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Pick reporting weeks, then select districts on the map or dropdown to compare them.
          </p>
        </div>

        {loading && (
          <p className="text-sm text-zinc-500">Loading surveillance data...</p>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && !error && data && (
          <>
            {/* Week Selection Dropdowns */}
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3 sm:p-4 block">
                <span className="text-xs text-zinc-500">Earlier week</span>
                <select
                  value={activeWeekA}
                  onChange={(event) => {
                    setWeekAKey(event.target.value);
                    setSelectedDistricts([]);
                  }}
                  className="mt-2 w-full rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm p-2.5 focus:outline-none focus:border-zinc-700"
                >
                  {timelineKeys.map((key) => (
                    <option key={key} value={key}>
                      {formatWeekLabel(data[key].end_date)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3 sm:p-4 block">
                <span className="text-xs text-zinc-500">Later week</span>
                <select
                  value={activeWeekB}
                  onChange={(event) => {
                    setWeekBKey(event.target.value);
                    setSelectedDistricts([]);
                  }}
                  className="mt-2 w-full rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm p-2.5 focus:outline-none focus:border-zinc-700"
                >
                  {timelineKeys.map((key) => (
                    <option key={key} value={key}>
                      {formatWeekLabel(data[key].end_date)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Selection Map Section */}
            <ComparisonMap
              geoJson={geoJson}
              weekA={weekA}
              weekB={weekB}
              labelA={labelA}
              labelB={labelB}
              selectedDistricts={selectedDistricts}
              onDistrictSelect={handleDistrictToggle}
            />

            {/* Search and Dropdown Filter Container */}
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
                    Select Districts to Compare
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Click districts on the maps or select them below to compare side-by-side.
                  </p>
                </div>

                {/* Searchable Combobox */}
                <div ref={dropdownRef} className="relative w-full md:w-[280px]">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm px-3.5 py-2 hover:border-zinc-700 transition-colors"
                  >
                    <span className="truncate">
                      {selectedDistricts.length === 0
                        ? "Select districts..."
                        : `${selectedDistricts.length} selected`}
                    </span>
                    <ChevronDown className="h-4 w-4 text-zinc-500 ml-2 shrink-0" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl p-2 max-h-[300px] overflow-hidden flex flex-col">
                      <div className="relative mb-2 shrink-0">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Search district..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                        {filteredDistricts.length === 0 ? (
                          <p className="text-xs text-zinc-500 text-center py-4">No districts found</p>
                        ) : (
                          filteredDistricts.map((district) => {
                            const isChecked = selectedDistricts.includes(district);
                            return (
                              <button
                                key={district}
                                onClick={() => handleDistrictToggle(district)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors ${
                                  isChecked
                                    ? "bg-zinc-800/60 text-zinc-100 font-medium"
                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                                }`}
                              >
                                <span>{district}</span>
                                {isChecked && <Check className="h-3.5 w-3.5 text-sky-400" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Selection Tags */}
              {selectedDistricts.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/40 items-center">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mr-1">
                    Comparing:
                  </span>
                  {selectedDistricts.map((district) => (
                    <span
                      key={district}
                      className="inline-flex items-center gap-1 bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-xs px-2.5 py-1 rounded-md"
                    >
                      {district}
                      <button
                        onClick={() => handleDistrictToggle(district)}
                        className="text-zinc-500 hover:text-zinc-350 p-0.5 rounded transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-medium ml-auto px-2 py-1 rounded hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Side-by-Side metrics table */}
            {weekA && weekB && (
              <DistrictComparisonTable
                selectedDistricts={selectedDistricts}
                weekA={weekA}
                weekB={weekB}
                labelA={labelA}
                labelB={labelB}
                onRemoveDistrict={handleDistrictToggle}
              />
            )}

            {/* Graphical representation (Vertical Bar Chart) */}
            <WeeklyComparisonChart
              weekA={weekA}
              weekB={weekB}
              labelA={labelA}
              labelB={labelB}
              selectedDistricts={selectedDistricts}
            />
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
