import React, { createContext, useContext, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Subject,
  Chapter,
  QuizResult,
  StreakInfo,
  DailyActivityRecord,
  Badge,
  LeaderboardUser,
  ActiveView,
} from "../types";
import { INITIAL_SUBJECTS, INITIAL_BADGES, INITIAL_LEADERBOARD } from "../data/mockCurriculum";

interface StudyContextType {
  // Navigation
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
  selectedChapterId: string | null;
  setSelectedChapterId: (id: string | null) => void;
  
  // Data
  subjects: Subject[];
  streakInfo: StreakInfo;
  activityHeatmap: DailyActivityRecord[];
  quizHistory: QuizResult[];
  badges: Badge[];
  leaderboard: LeaderboardUser[];
  studentName: string;
  setStudentName: (name: string) => void;
  xp: number;

  // Actions
  openChapterNotes: (subjectId: string, chapterId: string) => void;
  startQuizOnChapter: (subjectId: string, chapterId: string) => void;
  markChapterCompleted: (chapterId: string) => void;
  toggleBookmark: (chapterId: string) => void;
  recordQuizResult: (result: QuizResult) => void;
  addNewChapter: (chapter: Omit<Chapter, "id" | "isCompleted" | "isBookmarked">) => void;
  useStreakFreezeToken: () => boolean;
  triggerCelebration: (type?: "streak" | "badge" | "quiz-perfect") => void;
  playChimeSound: (type: "correct" | "incorrect" | "celebrate" | "click") => void;
  
  // Stats
  totalNotesRead: number;
  totalQuizzesTaken: number;
  totalSubjectsCovered: number;
  averageQuizScore: number;
  lastReadChapter: { subject: Subject; chapter: Chapter } | null;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

// Generate realistic 120-day heatmap records up to today (2026-08-24)
function generateInitialHeatmap(): DailyActivityRecord[] {
  const records: DailyActivityRecord[] = [];
  const today = new Date("2026-08-24T12:00:00Z");
  
  for (let i = 119; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    // For the last 12 days (current streak), active count is >= 1
    let count = 0;
    let notesRead = 0;
    let quizzes = 0;
    let minutes = 0;
    
    if (i <= 11) {
      // 12-day active streak
      count = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
      notesRead = Math.floor(Math.random() * 2) + 1;
      quizzes = Math.floor(Math.random() * 2) + 1;
      minutes = count * 25;
    } else {
      // Prior days had intermittent study sessions
      const rand = Math.random();
      if (rand > 0.35) {
        count = Math.floor(Math.random() * 4) + 1;
        notesRead = Math.floor(Math.random() * 2);
        quizzes = Math.floor(Math.random() * 2);
        minutes = count * 20;
      }
    }
    
    records.push({
      date: dateStr,
      count,
      notesReadCount: notesRead,
      quizzesCompleted: quizzes,
      studyMinutes: minutes,
    });
  }
  return records;
}

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation states
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>("physics");
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>("phy-ch1");

  // Local storage persisted state
  const [studentName, setStudentNameState] = useState<string>(() => {
    return localStorage.getItem("studystreak_name") || "Alex Rivers";
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem("studystreak_subjects");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved subjects", e);
      }
    }
    return INITIAL_SUBJECTS;
  });

  const [streakInfo, setStreakInfo] = useState<StreakInfo>(() => {
    const saved = localStorage.getItem("studystreak_streak");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      currentStreak: 12,
      longestStreak: 21,
      totalActiveDays: 64,
      lastActiveDate: "2026-08-24",
      freezeTokens: 2,
      flameLevel: 3,
    };
  });

  const [activityHeatmap, setActivityHeatmap] = useState<DailyActivityRecord[]>(() => {
    const saved = localStorage.getItem("studystreak_heatmap");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return generateInitialHeatmap();
  });

  const [quizHistory, setQuizHistory] = useState<QuizResult[]>(() => {
    const saved = localStorage.getItem("studystreak_quiz_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "init_quiz_1",
        chapterId: "phy-ch1",
        chapterTitle: "Electric Charges and Fields",
        subjectId: "physics",
        subjectName: "Physics",
        publication: "NCERT",
        score: 5,
        total: 5,
        percentage: 100,
        timeTakenSeconds: 145,
        timestamp: "2026-08-24T18:30:00.000Z",
        difficulty: "Medium",
        questions: [],
        userAnswers: [1, 2, 1, 2, 1],
      },
      {
        id: "init_quiz_2",
        chapterId: "chem-ch1",
        chapterTitle: "Solutions and Colligative Properties",
        subjectId: "chemistry",
        subjectName: "Chemistry",
        publication: "NCERT",
        score: 4,
        total: 5,
        percentage: 80,
        timeTakenSeconds: 180,
        timestamp: "2026-08-23T16:15:00.000Z",
        difficulty: "Medium",
        questions: [],
        userAnswers: [0, 1, 1, 2, 0],
      },
    ];
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem("studystreak_badges");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_BADGES;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);
  const [xp, setXp] = useState<number>(() => {
    return parseInt(localStorage.getItem("studystreak_xp") || "1850", 10);
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("studystreak_subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("studystreak_streak", JSON.stringify(streakInfo));
  }, [streakInfo]);

  useEffect(() => {
    localStorage.setItem("studystreak_heatmap", JSON.stringify(activityHeatmap));
  }, [activityHeatmap]);

  useEffect(() => {
    localStorage.setItem("studystreak_quiz_history", JSON.stringify(quizHistory));
  }, [quizHistory]);

  useEffect(() => {
    localStorage.setItem("studystreak_badges", JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem("studystreak_xp", xp.toString());
  }, [xp]);

  const setStudentName = (name: string) => {
    setStudentNameState(name);
    localStorage.setItem("studystreak_name", name);
    // Update leaderboard display
    setLeaderboard((prev) =>
      prev.map((u) => (u.isCurrentUser ? { ...u, name: `${name} (You)` } : u))
    );
  };

  // Audio effects synthesizer
  const playChimeSound = (type: "correct" | "incorrect" | "celebrate" | "click") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "correct") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime + 0.08);
        osc1.stop(ctx.currentTime + 0.35);
        osc2.stop(ctx.currentTime + 0.35);
      } else if (type === "celebrate") {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
        });
      } else if (type === "incorrect") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  const triggerCelebration = (type?: "streak" | "badge" | "quiz-perfect") => {
    playChimeSound("celebrate");
    if (type === "quiz-perfect") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#6366f1"],
      });
    } else {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#f97316", "#ef4444", "#fbbf24", "#10b981", "#3b82f6"],
      });
    }
  };

  const openChapterNotes = (subjectId: string, chapterId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedChapterId(chapterId);
    setActiveView("notes-viewer");
    recordActivityForToday("notes");
  };

  const startQuizOnChapter = (subjectId: string, chapterId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedChapterId(chapterId);
    setActiveView("ai-quiz");
  };

  const recordActivityForToday = (type: "notes" | "quiz") => {
    const todayStr = new Date().toISOString().split("T")[0];
    setActivityHeatmap((prev) => {
      const idx = prev.findIndex((r) => r.date === todayStr);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          count: Math.min(updated[idx].count + 1, 4),
          notesReadCount: updated[idx].notesReadCount + (type === "notes" ? 1 : 0),
          quizzesCompleted: updated[idx].quizzesCompleted + (type === "quiz" ? 1 : 0),
          studyMinutes: updated[idx].studyMinutes + 15,
        };
        return updated;
      } else {
        return [
          ...prev.slice(1),
          {
            date: todayStr,
            count: 1,
            notesReadCount: type === "notes" ? 1 : 0,
            quizzesCompleted: type === "quiz" ? 1 : 0,
            studyMinutes: 15,
          },
        ];
      }
    });
  };

  const markChapterCompleted = (chapterId: string) => {
    let wasAlreadyCompleted = false;
    setSubjects((prev) =>
      prev.map((sub) => {
        const chap = sub.chapters.find((c) => c.id === chapterId);
        if (chap) {
          wasAlreadyCompleted = chap.isCompleted;
        }
        return {
          ...sub,
          chapters: sub.chapters.map((c) => {
            if (c.id === chapterId) {
              return {
                ...c,
                isCompleted: !c.isCompleted,
                lastReadDate: new Date().toISOString().split("T")[0],
              };
            }
            return c;
          }),
        };
      })
    );

    if (!wasAlreadyCompleted) {
      setXp((prev) => prev + 50);
      recordActivityForToday("notes");
      playChimeSound("correct");
    }
  };

  const toggleBookmark = (chapterId: string) => {
    playChimeSound("click");
    setSubjects((prev) =>
      prev.map((sub) => ({
        ...sub,
        chapters: sub.chapters.map((c) =>
          c.id === chapterId ? { ...c, isBookmarked: !c.isBookmarked } : c
        ),
      }))
    );
  };

  const recordQuizResult = (result: QuizResult) => {
    setQuizHistory((prev) => [result, ...prev]);
    recordActivityForToday("quiz");

    // XP calculation: base 50 XP + 20 XP per correct question
    const gainedXp = 50 + result.score * 20;
    setXp((prev) => prev + gainedXp);

    // Update streak if today is active
    const todayStr = new Date().toISOString().split("T")[0];
    if (streakInfo.lastActiveDate !== todayStr) {
      const newStreak = streakInfo.currentStreak + 1;
      const newLongest = Math.max(newStreak, streakInfo.longestStreak);
      const newFlame = Math.min(Math.floor(newStreak / 5) + 1, 5);

      setStreakInfo((prev) => ({
        ...prev,
        currentStreak: newStreak,
        longestStreak: newLongest,
        totalActiveDays: prev.totalActiveDays + 1,
        lastActiveDate: todayStr,
        flameLevel: newFlame,
      }));

      triggerCelebration("streak");
    }

    // Auto mark chapter completed if scored >= 80%
    if (result.percentage >= 80) {
      setSubjects((prev) =>
        prev.map((sub) => ({
          ...sub,
          chapters: sub.chapters.map((c) =>
            c.id === result.chapterId ? { ...c, isCompleted: true } : c
          ),
        }))
      );
    }

    // Check Badges
    checkBadges(result);
  };

  const checkBadges = (latestQuiz?: QuizResult) => {
    setBadges((prev) =>
      prev.map((b) => {
        if (b.unlockedAt) return b;
        let updatedProgress = b.progress;
        let shouldUnlock = false;

        if (b.id === "badge-first-step") {
          updatedProgress = 1;
          shouldUnlock = true;
        } else if (b.id === "badge-week-warrior" && streakInfo.currentStreak >= 7) {
          updatedProgress = 7;
          shouldUnlock = true;
        } else if (b.id === "badge-monthly-legend") {
          updatedProgress = streakInfo.currentStreak;
          if (streakInfo.currentStreak >= 30) shouldUnlock = true;
        } else if (b.id === "badge-quiz-ace" && latestQuiz && latestQuiz.percentage === 100) {
          updatedProgress = b.progress + 1;
          if (updatedProgress >= 5) shouldUnlock = true;
        } else if (b.id === "badge-ai-innovator" && latestQuiz) {
          updatedProgress = b.progress + 1;
          if (updatedProgress >= 10) shouldUnlock = true;
        }

        if (shouldUnlock) {
          triggerCelebration("badge");
          return {
            ...b,
            progress: b.maxProgress,
            unlockedAt: new Date().toISOString().split("T")[0],
          };
        }
        return { ...b, progress: updatedProgress };
      })
    );
  };

  const addNewChapter = (newChapterData: Omit<Chapter, "id" | "isCompleted" | "isBookmarked">) => {
    const newId = `custom-ch-${Date.now()}`;
    const newChapter: Chapter = {
      ...newChapterData,
      id: newId,
      isCompleted: false,
      isBookmarked: false,
      lastReadDate: new Date().toISOString().split("T")[0],
      customUploaded: true,
    };

    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === newChapter.subjectId) {
          return {
            ...sub,
            chapters: [newChapter, ...sub.chapters],
          };
        }
        return sub;
      })
    );

    // Unlock knowledge contributor badge
    setBadges((prev) =>
      prev.map((b) =>
        b.id === "badge-community-uploader"
          ? { ...b, progress: 1, unlockedAt: new Date().toISOString().split("T")[0] }
          : b
      )
    );

    setXp((prev) => prev + 100);
    triggerCelebration("badge");
  };

  const useStreakFreezeToken = () => {
    if (streakInfo.freezeTokens > 0) {
      setStreakInfo((prev) => ({
        ...prev,
        freezeTokens: prev.freezeTokens - 1,
      }));
      playChimeSound("correct");
      return true;
    }
    return false;
  };

  // Derived Stats
  const totalNotesRead = subjects.reduce(
    (acc, s) => acc + s.chapters.filter((c) => c.isCompleted).length,
    0
  );

  const totalQuizzesTaken = quizHistory.length;

  const totalSubjectsCovered = subjects.filter((s) =>
    s.chapters.some((c) => c.isCompleted)
  ).length;

  const averageQuizScore =
    quizHistory.length > 0
      ? Math.round(
          quizHistory.reduce((acc, q) => acc + q.percentage, 0) / quizHistory.length
        )
      : 85;

  // "Continue where you left off" chapter
  const lastReadChapter = React.useMemo(() => {
    for (const sub of subjects) {
      const found = sub.chapters.find((c) => c.id === selectedChapterId);
      if (found) return { subject: sub, chapter: found };
    }
    // Default fallback to first subject's first chapter
    return { subject: subjects[0], chapter: subjects[0]?.chapters[0] };
  }, [subjects, selectedChapterId]);

  return (
    <StudyContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedSubjectId,
        setSelectedSubjectId,
        selectedChapterId,
        setSelectedChapterId,
        subjects,
        streakInfo,
        activityHeatmap,
        quizHistory,
        badges,
        leaderboard,
        studentName,
        setStudentName,
        xp,
        openChapterNotes,
        startQuizOnChapter,
        markChapterCompleted,
        toggleBookmark,
        recordQuizResult,
        addNewChapter,
        useStreakFreezeToken,
        triggerCelebration,
        playChimeSound,
        totalNotesRead,
        totalQuizzesTaken,
        totalSubjectsCovered,
        averageQuizScore,
        lastReadChapter,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error("useStudy must be used within a StudyProvider");
  }
  return context;
};
