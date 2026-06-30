import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";

export default function About() {
  return (
    <>
      <Header currentPage="about" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-5 sm:p-8 space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-medium text-zinc-100">
              Sri Lanka Dengue Surveillance Hub
            </h1>
            <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
              An interactive dashboard for exploring weekly dengue case trends
              across Sri Lanka&apos;s districts.
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-zinc-300">What this shows</h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              The home page displays the latest weekly report with a choropleth
              map colored by district risk level, cumulative case history, visual
              weather indicators, and detailed metrics when you select a district.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-zinc-300">Compare view</h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Pick two weeks, tap a district on the map, and review side-by-side
              maps with a horizontal comparison chart below.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-zinc-300">Data sources</h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              District boundaries come from GeoJSON map data. Weekly cases,
              cumulative totals, weather indicators, and risk classifications are
              loaded from the bundled epidemiological dataset.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
