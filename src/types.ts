export interface ChapterNoteSection {
  title: string;
  content: string;
  formulae?: string[];
  keyPoints?: string[];
  solvedExample?: {
    problem: string;
    solution: string;
  };
}

export interface Chapter {
  id: string;
  subjectId: string;
  chapterNumber: number;
  title: string;
  publication: string;
  edition: string;
  author?: string;
  pageCount: number;
  readTimeMinutes: number;
  isCompleted: boolean;
  isBookmarked: boolean;
  lastReadDate?: string;
  keyTopics: string[];
  summary: string;
  sections: ChapterNoteSection[];
  formulaCheatsheet?: string[];
  importantQuestionsCount?: number;
  customUploaded?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  iconName: string;
  colorScheme: {
    bg: string;
    border: string;
    accent: string;
    badge: string;
    text: string;
    lightBg: string;
  };
  description: string;
  publications: string[];
  chapters: Chapter[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subtopic: string;
}

export interface QuizResult {
  id: string;
  chapterId: string;
  chapterTitle: string;
  subjectId: string;
  subjectName: string;
  publication: string;
  score: number;
  total: number;
  percentage: number;
  timeTakenSeconds: number;
  timestamp: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: QuizQuestion[];
  userAnswers: number[];
}

export interface DailyActivityRecord {
  date: string; // YYYY-MM-DD
  count: number; // 0, 1, 2, 3, 4+ (activity level)
  notesReadCount: number;
  quizzesCompleted: number;
  studyMinutes: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string;
  freezeTokens: number;
  flameLevel: number; // 1 to 5
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "streak" | "quiz" | "notes" | "mastery";
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  xp: number;
  quizzesTaken: number;
  isCurrentUser?: boolean;
  badgeTitle: string;
}

export type ActiveView = 
  | "dashboard"
  | "subjects"
  | "chapter-list"
  | "notes-viewer"
  | "ai-quiz"
  | "upload-notes"
  | "streak-rewards";
