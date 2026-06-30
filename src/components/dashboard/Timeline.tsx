import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimelineProps {
  timelineKeys: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function Timeline({
  timelineKeys,
  selectedDate,
  onDateChange,
}: TimelineProps) {
  const currentIndex = timelineKeys.indexOf(selectedDate);

  const previousWeek = () => {
    if (currentIndex > 0) {
      onDateChange(timelineKeys[currentIndex - 1]);
    }
  };

  const nextWeek = () => {
    if (currentIndex < timelineKeys.length - 1) {
      onDateChange(timelineKeys[currentIndex + 1]);
    }
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4 sm:p-5">
      <p className="text-xs uppercase tracking-wide text-zinc-500">
        Weekly timeline
      </p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          onClick={previousWeek}
          disabled={currentIndex === 0}
          aria-label="Previous week"
          className="p-2 rounded-md border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center min-w-0 flex-1">
          <p className="text-sm text-zinc-100 truncate">{formattedDate}</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            Week {currentIndex + 1} of {timelineKeys.length}
          </p>
        </div>

        <button
          onClick={nextWeek}
          disabled={currentIndex === timelineKeys.length - 1}
          aria-label="Next week"
          className="p-2 rounded-md border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-4 h-1.5 w-full rounded-full bg-zinc-800/80 overflow-hidden">
        <div
          className="h-full rounded-full bg-zinc-400 transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / timelineKeys.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
