import React, { useState } from "react";
import {
  Flame,
  Trophy,
  Award,
  Shield,
  Sparkles,
  Crown,
  Target,
  BookOpenCheck,
  Brain,
  UploadCloud,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Share2,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { Badge } from "../types";

export const StreakRewardsView: React.FC = () => {
  const {
    streakInfo,
    badges,
    leaderboard,
    xp,
    useStreakFreezeToken,
    triggerCelebration,
    playChimeSound,
  } = useStudy();

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [claimedReward, setClaimedReward] = useState<boolean>(false);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Flame":
        return <Flame className="w-5 h-5" />;
      case "Crown":
        return <Crown className="w-5 h-5" />;
      case "Trophy":
        return <Trophy className="w-5 h-5" />;
      case "Target":
        return <Target className="w-5 h-5" />;
      case "BookOpenCheck":
        return <BookOpenCheck className="w-5 h-5" />;
      case "Brain":
        return <Brain className="w-5 h-5" />;
      case "UploadCloud":
        return <UploadCloud className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const filteredBadges = badges.filter((b) => {
    if (filterCategory === "all") return true;
    if (filterCategory === "unlocked") return b.unlockedAt !== null;
    if (filterCategory === "locked") return b.unlockedAt === null;
    return b.category === filterCategory;
  });

  const unlockedCount = badges.filter((b) => b.unlockedAt !== null).length;

  const handleUseFreeze = () => {
    const success = useStreakFreezeToken();
    if (success) {
      triggerCelebration("streak");
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* 1. Interactive Animated Streak Flame Showcase */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        {/* Flame glow backdrops */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          {/* Animated Super Flame */}
          <div
            onClick={() => {
              triggerCelebration("streak");
            }}
            title="Click to celebrate your streak!"
            className="relative cursor-pointer group"
          >
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-300 p-1 flex items-center justify-center shadow-2xl shadow-orange-500/40 group-hover:scale-105 transition-transform duration-300 animate-pulse">
              <div className="w-full h-full rounded-full bg-slate-950/80 flex items-center justify-center">
                <Flame className="w-16 h-16 sm:w-20 sm:h-20 text-orange-400 fill-amber-300 animate-bounce" />
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-orange-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
              Stage {streakInfo.flameLevel} Flame
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              {streakInfo.currentStreak} Day Study Streak!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Your flame is burning bright. Study daily to evolve your flame to Stage 5 at 30 days!
            </p>
          </div>

          {/* Key Streak Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl pt-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Streak</span>
              <span className="text-xl sm:text-2xl font-extrabold text-orange-400">{streakInfo.currentStreak} Days</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Longest Record</span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-300">{streakInfo.longestStreak} Days</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Active</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">{streakInfo.totalActiveDays} Days</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Streak Freezes</span>
              <span className="text-xl sm:text-2xl font-extrabold text-cyan-300">{streakInfo.freezeTokens} Left</span>
            </div>
          </div>

          {/* Streak Freeze Safety Shield */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="use-streak-freeze-btn"
              onClick={handleUseFreeze}
              disabled={streakInfo.freezeTokens <= 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 disabled:opacity-40 border border-cyan-400/40 text-cyan-200 text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
            >
              <Shield className="w-4 h-4 text-cyan-300" />
              <span>Use Streak Freeze Shield</span>
            </button>

            <button
              onClick={() => {
                triggerCelebration("streak");
                playChimeSound("celebrate");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Celebrate Streak</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Badges & Milestone Achievements */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <span>Badges & Milestones</span>
            </h2>
            <p className="text-xs text-slate-500">
              Unlocked {unlockedCount} of {badges.length} achievements
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All Badges" },
              { id: "unlocked", label: "Unlocked" },
              { id: "streak", label: "Streak" },
              { id: "quiz", label: "Quiz" },
              { id: "notes", label: "Notes" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilterCategory(f.id);
                  playChimeSound("click");
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterCategory === f.id
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = badge.unlockedAt !== null;
            const progressPercent = Math.round((badge.progress / badge.maxProgress) * 100);

            return (
              <div
                key={badge.id}
                onClick={() => {
                  if (isUnlocked) {
                    triggerCelebration("badge");
                  }
                }}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isUnlocked
                    ? "bg-white border-amber-200 shadow-xs hover:shadow-md hover:border-amber-400"
                    : "bg-slate-50/70 border-slate-200/80 opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isUnlocked
                          ? "bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-xs"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {getBadgeIcon(badge.icon)}
                    </div>
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{badge.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Progress</span>
                    <span className="font-bold text-slate-700">
                      {badge.progress} / {badge.maxProgress}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUnlocked ? "bg-amber-500" : "bg-slate-300"
                      }`}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Study Group Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Study Group Consistency Leaderboard</h2>
              <p className="text-xs text-slate-500">Ranked by weekly unbroken study streaks & quiz XP</p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
            Updated Today
          </span>
        </div>

        <div className="space-y-3">
          {leaderboard.map((user, idx) => {
            const rank = idx + 1;
            return (
              <div
                key={user.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  user.isCurrentUser
                    ? "bg-blue-50/70 border-blue-200 shadow-xs"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                {/* Rank & User Info */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      rank === 1
                        ? "bg-amber-400 text-slate-950 shadow-xs"
                        : rank === 2
                        ? "bg-slate-300 text-slate-800"
                        : rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {rank}
                  </div>

                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                      {user.isCurrentUser && (
                        <span className="text-[10px] font-extrabold px-2 py-0.2 rounded bg-blue-600 text-white">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{user.badgeTitle}</p>
                  </div>
                </div>

                {/* Streak & XP Stats */}
                <div className="flex items-center gap-4 sm:gap-6 text-right">
                  <div className="hidden sm:block">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Quizzes</span>
                    <span className="text-xs font-bold text-slate-700">{user.quizzesTaken}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Streak</span>
                    <span className="text-sm font-extrabold text-orange-600 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-orange-500" />
                      <span>{user.streak}d</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total XP</span>
                    <span className="text-sm font-extrabold text-indigo-600">{user.xp}</span>
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
