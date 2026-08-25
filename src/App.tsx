import React from "react";
import { StudyProvider, useStudy } from "./context/StudyContext";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { SubjectsView } from "./components/SubjectsView";
import { ChapterListView } from "./components/ChapterListView";
import { NotesViewerView } from "./components/NotesViewerView";
import { AIQuizView } from "./components/AIQuizView";
import { UploadNotesView } from "./components/UploadNotesView";
import { StreakRewardsView } from "./components/StreakRewardsView";
import { Flame, Heart, Sparkles, BookOpen, GraduationCap } from "lucide-react";

const MainContent: React.FC = () => {
  const { activeView } = useStudy();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {activeView === "dashboard" && <DashboardView />}
      {activeView === "subjects" && <SubjectsView />}
      {activeView === "chapter-list" && <ChapterListView />}
      {activeView === "notes-viewer" && <NotesViewerView />}
      {activeView === "ai-quiz" && <AIQuizView />}
      {activeView === "upload-notes" && <UploadNotesView />}
      {activeView === "streak-rewards" && <StreakRewardsView />}
    </main>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <div className="flex-1 py-6 sm:py-8">
          <MainContent />
        </div>

        {/* Minimalist, Clean Student-friendly Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              </div>
              <span className="font-bold text-slate-800">StudyStreak</span>
              <span className="text-slate-400">— Chapter Notes & AI Self-Assessment</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="font-medium text-slate-600">Powered by Gemini AI</span>
              <span>•</span>
              <span>NCERT, Arihant, RD Sharma & HC Verma References</span>
            </div>
          </div>
        </footer>
      </div>
    </StudyProvider>
  );
}
