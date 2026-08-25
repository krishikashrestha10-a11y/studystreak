import React, { useState } from "react";
import {
  Flame,
  BookOpen,
  LayoutDashboard,
  Upload,
  Trophy,
  Sparkles,
  Search,
  CheckCircle2,
  Edit2,
  X,
  Check,
  Zap,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { ActiveView } from "../types";

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    streakInfo,
    studentName,
    setStudentName,
    xp,
    playChimeSound,
  } = useStudy();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(studentName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setStudentName(tempName.trim());
      playChimeSound("click");
    }
    setIsEditingName(false);
  };

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "subjects", label: "Subjects & Notes", icon: <BookOpen className="w-4 h-4" /> },
    { id: "upload-notes", label: "Upload Notes", icon: <Upload className="w-4 h-4" /> },
    { id: "streak-rewards", label: "Streak & Badges", icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              id="brand-logo-btn"
              onClick={() => {
                setActiveView("dashboard");
                playChimeSound("click");
              }}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  StudyStreak
                </span>
                <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                  Notes & AI Quizzes
                </span>
              </div>
            </button>

            {/* Desktop Navigation links */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4">
              {navItems.map((item) => {
                const isActive =
                  activeView === item.id ||
                  (item.id === "subjects" &&
                    (activeView === "chapter-list" ||
                      activeView === "notes-viewer" ||
                      activeView === "ai-quiz"));
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => {
                      setActiveView(item.id);
                      playChimeSound("click");
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls: Streak Pill, XP, Student Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Streak Counter Pill */}
            <button
              id="streak-counter-pill"
              onClick={() => {
                setActiveView("streak-rewards");
                playChimeSound("click");
              }}
              title="Click to view Streak & Rewards"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs sm:text-sm font-bold shadow-xs hover:border-orange-200 hover:scale-105 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>{streakInfo.currentStreak} Day Streak</span>
            </button>

            {/* XP Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>{xp} XP</span>
            </div>

            {/* User Profile / Student Name Editor */}
            <div className="relative">
              {isEditingName ? (
                <div className="flex items-center gap-1.5 bg-white border border-blue-400 rounded-xl p-1 shadow-md">
                  <input
                    id="student-name-input"
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    className="px-2 py-0.5 text-xs text-slate-800 focus:outline-none w-28"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    title="Save name"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  id="student-profile-btn"
                  onClick={() => {
                    setTempName(studentName);
                    setIsEditingName(true);
                  }}
                  title="Click to edit your name"
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs text-slate-700 font-semibold cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                    {studentName.charAt(0)}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">{studentName}</span>
                  <Edit2 className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 overflow-x-auto">
          {navItems.map((item) => {
            const isActive =
              activeView === item.id ||
              (item.id === "subjects" &&
                (activeView === "chapter-list" ||
                  activeView === "notes-viewer" ||
                  activeView === "ai-quiz"));
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  playChimeSound("click");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
