import { useMemo, useState } from "react";

import DistrictDetails from "../components/dashboard/DistrictDetails";
import Legend from "../components/dashboard/Legend";
import MapSection from "../components/dashboard/MapSection";
import RiskIndexCard from "../components/dashboard/RiskIndexCard";
import Timeline from "../components/dashboard/Timeline";
import WeeklyOverview from "../components/dashboard/WeeklyOverview";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import DengueMap from "../components/map/DengueMap";
import { useDengueData } from "../hooks/useDengueData";
import {
  getNationalStats,
  getPreviousDateKey,
  getTopDistricts,
  getWeeklyPayload,
} from "../utils/dengueStats";

export default function Home() {
  const { data, geoJson, timelineKeys, loading, error } = useDengueData();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const activeDate =
    selectedDate || timelineKeys[timelineKeys.length - 1] || "";

  const weeklyData = useMemo(() => {
    if (!data || !activeDate) {
      return null;
    }
    return getWeeklyPayload(data, activeDate);
  }, [data, activeDate]);

  const previousDateKey = useMemo(() => {
    if (!activeDate) {
      return null;
    }
    return getPreviousDateKey(timelineKeys, activeDate);
  }, [timelineKeys, activeDate]);

  const previousWeeklyData = useMemo(() => {
    if (!data || !previousDateKey) {
      return null;
    }
    return getWeeklyPayload(data, previousDateKey);
  }, [data, previousDateKey]);

  const nationalStats = useMemo(() => {
    if (!weeklyData) {
      return null;
    }
    return getNationalStats(weeklyData, previousWeeklyData);
  }, [weeklyData, previousWeeklyData]);

  const topDistricts = useMemo(() => {
    if (!weeklyData) {
      return [];
    }
    return getTopDistricts(weeklyData);
  }, [weeklyData]);

  const selectedMetrics =
    selectedDistrict && weeklyData
      ? weeklyData.districts[selectedDistrict] ?? null
      : null;

  const previousMetrics =
    selectedDistrict && previousWeeklyData
      ? previousWeeklyData.districts[selectedDistrict] ?? null
      : null;

  const weekLabel = weeklyData
    ? `Week ending ${new Date(weeklyData.end_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`
    : "Loading...";

  if (loading) {
    return (
      <>
        <Header currentPage="home" />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-sm text-zinc-500">
          Loading dengue surveillance data...
        </main>
      </>
    );
  }

  if (error || !data || !weeklyData || !nationalStats) {
    return (
      <>
        <Header currentPage="home" />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-sm text-red-400">
          {error ?? "Unable to load dashboard data."}
        </main>
      </>
    );
  }

  return (
    <>
      <Header currentPage="home" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <WeeklyOverview week={weekLabel} districts={topDistricts} />
          </div>

          <div className="space-y-4 sm:space-y-5 order-1 lg:order-2">
            <RiskIndexCard
              risk={nationalStats.risk}
              totalCases={nationalStats.totalCases}
              totalCumulative={nationalStats.totalCumulative}
              previousCumulative={nationalStats.previousCumulative}
              hotSpots={nationalStats.hotSpots}
              change={nationalStats.change}
              cumulativeChange={nationalStats.cumulativeChange}
              heavyRainDistricts={nationalStats.heavyRainDistricts}
              latestDate={nationalStats.endDate}
            />

            <Timeline
              timelineKeys={timelineKeys}
              selectedDate={activeDate}
              onDateChange={(date) => {
                setSelectedDate(date);
                setSelectedDistrict(null);
              }}
            />
          </div>
        </div>

        <MapSection
          children={
            <div className="space-y-4">
              <DengueMap
                geoJson={geoJson}
                weeklyData={weeklyData}
                selectedDistrict={selectedDistrict}
                onDistrictSelect={setSelectedDistrict}
              />
              <Legend />
            </div>
          }
          details={
            <DistrictDetails
              districtName={selectedDistrict}
              metrics={selectedMetrics}
              previousMetrics={previousMetrics}
            />
          }
        />
      </main>

      <Footer />
    </>
  );
}
