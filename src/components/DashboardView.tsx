import React from "react";
import {
  Flame,
  BookOpen,
  HelpCircle,
  FolderKanban,
  Award,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Play,
  Zap,
  BookCheck,
  ChevronRight,
  TrendingUp,
  Bookmark,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { HeatmapCalendar } from "./HeatmapCalendar";

export const DashboardView: React.FC = () => {
  const {
    studentName,
    streakInfo,
    subjects,
    totalNotesRead,
    totalQuizzesTaken,
    totalSubjectsCovered,
    averageQuizScore,
    lastReadChapter,
    openChapterNotes,
    startQuizOnChapter,
    setActiveView,
    setSelectedSubjectId,
    quizHistory,
    playChimeSound,
  } = useStudy();

  // Quick greeting calculation
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Sleek Top Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Study Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {getGreeting()}, <span className="text-blue-600">{studentName}</span>! 👋
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            You're on top of your game today. Continue chapter notes and AI quizzes to protect your daily study streak.
          </p>
        </div>

        {/* Sleek Streak Status Card */}
        <div className="flex items-center gap-4 bg-orange-50/70 border border-orange-100 p-4 sm:p-5 rounded-2xl self-start md:self-auto shrink-0">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500 text-white shadow-xs">
            <Flame className="w-7 h-7 fill-amber-300 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {streakInfo.currentStreak}
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-orange-600">
                Days
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">🔥 Active Streak</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Next milestone: <span className="font-semibold text-slate-700">30 Days</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Quick Key Stats Bar (4-Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Notes Read</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BookCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalNotesRead}</p>
          <p className="text-xs text-slate-400 mt-1">Chapters marked complete</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(totalNotesRead * 15, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">AI Quizzes</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalQuizzesTaken}</p>
          <p className="text-xs text-slate-400 mt-1">Assessments finished</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(totalQuizzesTaken * 20, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Accuracy</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{averageQuizScore}%</p>
          <p className="text-xs text-slate-400 mt-1">Across all topic quizzes</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${averageQuizScore}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Subjects</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {totalSubjectsCovered} <span className="text-sm font-normal text-slate-400">/ {subjects.length}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Curriculum progress</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all"
              style={{ width: `${Math.round((totalSubjectsCovered / (subjects.length || 1)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Continue Where You Left Off & Daily Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Reading Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Continue Where You Left Off
                </span>
              </div>
              {lastReadChapter && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                  {lastReadChapter.subject.name}
                </span>
              )}
            </div>

            {lastReadChapter ? (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {lastReadChapter.chapter.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>Publication: <strong className="text-slate-700">{lastReadChapter.chapter.publication}</strong></span>
                      <span>•</span>
                      <span>{lastReadChapter.chapter.readTimeMinutes} min read</span>
                      <span>•</span>
                      <span>{lastReadChapter.chapter.pageCount} pages</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {lastReadChapter.chapter.summary}
                </p>

                {/* Key Topic Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {lastReadChapter.chapter.keyTopics.slice(0, 4).map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select any chapter from subjects to begin reading.</p>
            )}
          </div>

          {/* Action Buttons */}
          {lastReadChapter && (
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                id="resume-reading-btn"
                onClick={() => {
                  openChapterNotes(lastReadChapter.subject.id, lastReadChapter.chapter.id);
                  playChimeSound("click");
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Resume Reading Notes</span>
              </button>

              <button
                id="quick-ai-quiz-btn"
                onClick={() => {
                  startQuizOnChapter(lastReadChapter.subject.id, lastReadChapter.chapter.id);
                  playChimeSound("click");
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Take AI Quiz</span>
              </button>
            </div>
          )}
        </div>

        {/* Daily Goals Checklist */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Today's Daily Target</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                2/3 Completed
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 line-through">Read 1 Chapter Note</p>
                  <p className="text-[11px] text-slate-400">Electric Charges & Fields (+50 XP)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 line-through">Complete 1 AI Quiz</p>
                  <p className="text-[11px] text-slate-400">Electrostatic Potential (+80 XP)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="w-5 h-5 rounded-full border-2 border-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-900">Revise Formula Cheatsheet</p>
                  <p className="text-[11px] text-blue-600">Review 5 key equations (+30 XP)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setActiveView("streak-rewards");
                playChimeSound("click");
              }}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-semibold transition-colors cursor-pointer"
            >
              <span>View Milestone Badges</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Streak Heatmap Calendar Component */}
      <HeatmapCalendar />

      {/* 5. Subjects Quick Access Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Explore Subjects & Chapters</h2>
            <p className="text-xs text-slate-500">Access curated publications and test with AI</p>
          </div>
          <button
            onClick={() => {
              setActiveView("subjects");
              playChimeSound("click");
            }}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <span>View All Subjects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const completedCount = sub.chapters.filter((c) => c.isCompleted).length;
            const progress = Math.round((completedCount / (sub.chapters.length || 1)) * 100);

            return (
              <div
                key={sub.id}
                onClick={() => {
                  setSelectedSubjectId(sub.id);
                  setActiveView("chapter-list");
                  playChimeSound("click");
                }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${sub.colorScheme.badge}`}>
                      {sub.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {completedCount}/{sub.chapters.length} Chapters
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{sub.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-medium">Mastery Progress</span>
                    <span className="font-bold text-slate-800">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
