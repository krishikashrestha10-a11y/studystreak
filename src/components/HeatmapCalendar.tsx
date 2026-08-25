import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import { DailyActivityRecord } from "../types";
import { Calendar, Flame, CheckCircle, HelpCircle } from "lucide-react";

export const HeatmapCalendar: React.FC = () => {
  const { activityHeatmap, streakInfo } = useStudy();
  const [hoveredDay, setHoveredDay] = useState<DailyActivityRecord | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Group heatmap records into weeks (7 days per column)
  const weeks: DailyActivityRecord[][] = [];
  let currentWeek: DailyActivityRecord[] = [];

  activityHeatmap.forEach((item, index) => {
    currentWeek.push(item);
    if (currentWeek.length === 7 || index === activityHeatmap.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-slate-100 hover:bg-slate-200 border border-slate-200/50";
    if (count === 1) return "bg-emerald-200 hover:bg-emerald-300 border border-emerald-300";
    if (count === 2) return "bg-emerald-400 hover:bg-emerald-500 border border-emerald-500 text-white";
    if (count === 3) return "bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 text-white";
    return "bg-emerald-700 hover:bg-emerald-800 border border-emerald-800 text-white shadow-xs";
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Study Consistency Tracker</h3>
            <p className="text-xs text-slate-400">
              {streakInfo.totalActiveDays} active study days recorded this year
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-xs bg-slate-100 border border-slate-200"></div>
            <div className="w-3 h-3 rounded-xs bg-emerald-200 border border-emerald-300"></div>
            <div className="w-3 h-3 rounded-xs bg-emerald-400 border border-emerald-500"></div>
            <div className="w-3 h-3 rounded-xs bg-emerald-500 border border-emerald-600"></div>
            <div className="w-3 h-3 rounded-xs bg-emerald-700 border border-emerald-800"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[620px]">
          {/* Month Labels */}
          <div className="flex text-[11px] text-slate-400 font-medium mb-1.5 ml-6 justify-between max-w-[580px]">
            <span>May</span>
            <span>June</span>
            <span>July</span>
            <span>August (Today)</span>
          </div>

          <div className="flex gap-1.5 items-start">
            {/* Weekday indicators */}
            <div className="flex flex-col gap-1.5 text-[10px] text-slate-400 font-medium pr-1 pt-0.5 select-none">
              <span className="h-3 leading-3">Mon</span>
              <span className="h-3 leading-3 opacity-0">Tue</span>
              <span className="h-3 leading-3">Wed</span>
              <span className="h-3 leading-3 opacity-0">Thu</span>
              <span className="h-3 leading-3">Fri</span>
              <span className="h-3 leading-3 opacity-0">Sat</span>
              <span className="h-3 leading-3">Sun</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1.5">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5">
                  {week.map((day, dIdx) => (
                    <div
                      key={`${wIdx}-${dIdx}`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredDay(day);
                        setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3.5 h-3.5 rounded-xs transition-colors cursor-pointer ${getColorClass(
                        day.count
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Floating Tooltip */}
      {hoveredDay && tooltipPos && (
        <div
          style={{
            position: "fixed",
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: "translate(-50%, -100%)",
          }}
          className="z-50 pointer-events-none bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700 min-w-[160px]"
        >
          <p className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1">
            {formatDate(hoveredDay.date)}
          </p>
          {hoveredDay.count === 0 ? (
            <p className="text-slate-400">No study logged</p>
          ) : (
            <div className="space-y-0.5 text-slate-300">
              <p className="flex justify-between">
                <span>Notes Read:</span>
                <span className="font-bold text-emerald-400">{hoveredDay.notesReadCount}</span>
              </p>
              <p className="flex justify-between">
                <span>Quizzes:</span>
                <span className="font-bold text-blue-400">{hoveredDay.quizzesCompleted}</span>
              </p>
              <p className="flex justify-between">
                <span>Study Time:</span>
                <span className="font-bold text-amber-400">{hoveredDay.studyMinutes}m</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Summary Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-600">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>Current Streak: <strong className="text-slate-900">{streakInfo.currentStreak} Days</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Longest Streak: <strong className="text-slate-900">{streakInfo.longestStreak} Days</strong></span>
          </div>
        </div>
        <p className="text-slate-400 italic">
          Tip: Completing 1 chapter note or 1 AI quiz extends your streak for today!
        </p>
      </div>
    </div>
  );
};
