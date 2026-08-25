import React, { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  MessageSquare,
  Send,
  Loader2,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";

type ReadingTheme = "white" | "sepia" | "dark";

export const NotesViewerView: React.FC = () => {
  const {
    subjects,
    selectedSubjectId,
    selectedChapterId,
    setActiveView,
    startQuizOnChapter,
    markChapterCompleted,
    toggleBookmark,
    playChimeSound,
    openChapterNotes,
  } = useStudy();

  const [fontSize, setFontSize] = useState<number>(16);
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>("white");
  const [showAiTutor, setShowAiTutor] = useState<boolean>(false);
  const [aiQuestion, setAiQuestion] = useState<string>("");
  const [aiAnswer, setAiAnswer] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const currentChapterIndex = currentSubject?.chapters.findIndex((c) => c.id === selectedChapterId) ?? 0;
  const currentChapter = currentSubject?.chapters[currentChapterIndex] || currentSubject?.chapters[0];

  if (!currentSubject || !currentChapter) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Note document not found.</p>
        <button
          onClick={() => setActiveView("subjects")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs"
        >
          Back to Subjects
        </button>
      </div>
    );
  }

  // Ask AI Tutor handler
  const handleAskAiTutor = async (customPrompt?: string) => {
    const questionToSend = customPrompt || aiQuestion;
    if (!questionToSend.trim()) return;

    setIsAiLoading(true);
    setAiAnswer("");
    setShowAiTutor(true);

    try {
      const response = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionToSend,
          context: currentChapter.summary + " " + currentChapter.sections.map((s) => s.content).join(" "),
          subject: currentSubject.name,
          chapterName: currentChapter.title,
        }),
      });

      const data = await response.json();
      if (data.success && data.explanation) {
        setAiAnswer(data.explanation);
        playChimeSound("correct");
      } else {
        setAiAnswer(
          `**Key Takeaway for ${currentChapter.title}:**\nRemember to break the problem into standard SI variables and apply the governing equations directly.`
        );
      }
    } catch (e) {
      setAiAnswer("Unable to reach AI tutor right now. Review the formula cheat sheet below for quick revision.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDownload = () => {
    playChimeSound("click");
    const content = `# ${currentChapter.title} - ${currentSubject.name}\nPublication: ${currentChapter.publication} (${currentChapter.edition})\n\nSummary:\n${currentChapter.summary}\n\nKey Formulas:\n${(currentChapter.formulaCheatsheet || []).join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentChapter.title.replace(/\s+/g, "_")}_Notes.txt`;
    a.click();
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `${currentChapter.title} (${currentChapter.publication})\n${currentChapter.summary}`
    );
    setCopiedNote(true);
    playChimeSound("click");
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const prevChapter = currentChapterIndex > 0 ? currentSubject.chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < currentSubject.chapters.length - 1 ? currentSubject.chapters[currentChapterIndex + 1] : null;

  const themeClasses = {
    white: "bg-white text-slate-800 border-slate-200",
    sepia: "bg-[#fbf7ee] text-[#433422] border-[#e6dcce]",
    dark: "bg-[#181d28] text-slate-100 border-slate-700",
  }[readingTheme];

  const calloutClasses = {
    white: "bg-blue-50/70 border-blue-200 text-blue-950",
    sepia: "bg-[#f1e7d0] border-[#d8c7a6] text-[#3d2f1f]",
    dark: "bg-slate-800/80 border-slate-700 text-blue-200",
  }[readingTheme];

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Top Navigation & Document Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-sm">
        <button
          id="back-to-chapter-list-btn"
          onClick={() => {
            setActiveView("chapter-list");
            playChimeSound("click");
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentSubject.name} Chapters</span>
        </button>

        {/* Reader Preferences (Theme, Font Size, Bookmark, Complete) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Font sizing */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setFontSize((f) => Math.max(f - 1, 13))}
              title="Decrease font size"
              className="p-1 text-slate-600 hover:text-slate-900 rounded cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold px-1.5 text-slate-700">{fontSize}px</span>
            <button
              onClick={() => setFontSize((f) => Math.min(f + 1, 22))}
              title="Increase font size"
              className="p-1 text-slate-600 hover:text-slate-900 rounded cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme toggles */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setReadingTheme("white")}
              title="Classic White paper"
              className={`px-2 py-0.5 text-[11px] font-semibold rounded cursor-pointer ${
                readingTheme === "white" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setReadingTheme("sepia")}
              title="Sepia Book paper"
              className={`px-2 py-0.5 text-[11px] font-semibold rounded cursor-pointer ${
                readingTheme === "sepia" ? "bg-[#fbf7ee] text-[#433422] shadow-xs" : "text-slate-500"
              }`}
            >
              Sepia
            </button>
            <button
              onClick={() => setReadingTheme("dark")}
              title="Dark Scholar paper"
              className={`px-2 py-0.5 text-[11px] font-semibold rounded cursor-pointer ${
                readingTheme === "dark" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500"
              }`}
            >
              Dark
            </button>
          </div>

          {/* Bookmark */}
          <button
            id="notes-bookmark-btn"
            onClick={() => toggleBookmark(currentChapter.id)}
            title={currentChapter.isBookmarked ? "Bookmarked" : "Bookmark notes"}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              currentChapter.isBookmarked
                ? "bg-amber-50 border-amber-300 text-amber-600"
                : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${currentChapter.isBookmarked ? "fill-amber-500" : ""}`} />
          </button>

          {/* Mark Complete */}
          <button
            id="notes-mark-complete-btn"
            onClick={() => markChapterCompleted(currentChapter.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              currentChapter.isCompleted
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentChapter.isCompleted ? "Completed" : "Mark Done"}</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            title="Download Notes Summary"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 bg-white cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Document / PDF-Style Viewer Card */}
      <article
        className={`rounded-2xl border p-6 sm:p-10 shadow-sm transition-colors ${themeClasses}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {/* Document Header Metadata */}
        <header className="border-b border-slate-200/70 pb-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs opacity-75 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">
                {currentSubject.name}
              </span>
              <span>•</span>
              <span>Chapter {currentChapter.chapterNumber}</span>
              <span>•</span>
              <span>{currentChapter.pageCount} Pages</span>
            </div>

            <div className="flex items-center gap-2 font-medium">
              <span>Publication: <strong className="font-bold">{currentChapter.publication}</strong></span>
              <span>({currentChapter.edition})</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentChapter.title}
          </h1>

          {/* Quick Key Topics Pill Row */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {currentChapter.keyTopics.map((topic, i) => (
              <span
                key={i}
                onClick={() => handleAskAiTutor(`Explain ${topic} with key formulas and simple examples.`)}
                title="Click to ask AI Tutor about this topic"
                className="text-xs px-2.5 py-1 rounded-md bg-slate-500/10 font-medium hover:bg-blue-500/20 hover:text-blue-600 transition-colors cursor-pointer"
              >
                #{topic}
              </span>
            ))}
          </div>
        </header>

        {/* Chapter Executive Summary Callout */}
        <div className={`p-4 rounded-2xl border mb-8 ${calloutClasses}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Executive Overview & Key Takeaways</h3>
            </div>
            <button
              onClick={handleCopySummary}
              className="text-xs flex items-center gap-1 opacity-70 hover:opacity-100 cursor-pointer"
            >
              {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNote ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <p className="text-sm leading-relaxed">{currentChapter.summary}</p>
        </div>

        {/* Document Body Sections */}
        <div className="space-y-8">
          {currentChapter.sections.map((sec, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight border-b border-slate-200/50 pb-2">
                {sec.title}
              </h2>
              <p className="leading-relaxed text-sm sm:text-base opacity-90">
                {sec.content}
              </p>

              {/* Mathematical Formulae Box */}
              {sec.formulae && sec.formulae.length > 0 && (
                <div className="my-4 p-4 rounded-xl bg-slate-500/5 border border-slate-300/40 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60 block">
                    Core Formulae & Governing Equations
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {sec.formulae.map((f, fIdx) => (
                      <div
                        key={fIdx}
                        className="px-3 py-2 rounded-lg bg-white/70 font-mono text-xs sm:text-sm font-semibold border border-slate-200/60 shadow-2xs"
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Concept Points */}
              {sec.keyPoints && sec.keyPoints.length > 0 && (
                <ul className="space-y-2 pl-4 list-disc text-sm opacity-90">
                  {sec.keyPoints.map((pt, pIdx) => (
                    <li key={pIdx} className="leading-relaxed">
                      {pt}
                    </li>
                  ))}
                </ul>
              )}

              {/* Solved Example Box */}
              {sec.solvedExample && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-300/60 space-y-2 text-sm">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                    💡 Standard Solved Exam Problem
                  </span>
                  <p className="font-semibold">{sec.solvedExample.problem}</p>
                  <p className="text-xs opacity-90 pl-3 border-l-2 border-emerald-500">
                    <strong>Solution:</strong> {sec.solvedExample.solution}
                  </p>
                </div>
              )}
            </section>
          ))}

          {/* Formula Cheatsheet Drawer Card */}
          {currentChapter.formulaCheatsheet && currentChapter.formulaCheatsheet.length > 0 && (
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/70 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-blue-950">Quick Revision Formula Cheatsheet</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentChapter.formulaCheatsheet.map((formula, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-2.5 rounded-lg bg-white/90 border border-blue-100 text-xs font-mono font-medium shadow-2xs text-slate-900"
                  >
                    {formula}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* AI Tutor Assistant Drawer / Popup */}
      {showAiTutor && (
        <div className="bg-white rounded-3xl border border-blue-200 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-blue-700">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-bold">AI Study Coach & Doubt Solver</h3>
            </div>
            <button
              onClick={() => setShowAiTutor(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {isAiLoading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-sm text-blue-600 font-medium">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing chapter notes and generating explanation...</span>
              </div>
            ) : aiAnswer ? (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs sm:text-sm text-slate-800 space-y-2 whitespace-pre-wrap leading-relaxed">
                {aiAnswer}
              </div>
            ) : null}

            {/* Input for student questions */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask any doubt regarding this chapter..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskAiTutor()}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                id="send-ai-doubt-btn"
                onClick={() => handleAskAiTutor()}
                disabled={isAiLoading || !aiQuestion.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Bar with "Take AI Quiz on this Chapter" */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3">
          {/* Prev Chapter */}
          <button
            onClick={() => {
              if (prevChapter) {
                openChapterNotes(currentSubject.id, prevChapter.id);
                playChimeSound("click");
              }
            }}
            disabled={!prevChapter}
            title={prevChapter ? `Previous: ${prevChapter.title}` : "First chapter"}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* AI Doubt trigger button */}
          <button
            id="open-ai-tutor-btn"
            onClick={() => {
              setShowAiTutor((prev) => !prev);
              playChimeSound("click");
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask AI Coach</span>
          </button>

          {/* Take AI Quiz Button */}
          <button
            id="take-ai-quiz-bottom-btn"
            onClick={() => {
              startQuizOnChapter(currentSubject.id, currentChapter.id);
              playChimeSound("click");
            }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all transform hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Take AI Quiz on this Chapter</span>
          </button>

          {/* Next Chapter */}
          <button
            onClick={() => {
              if (nextChapter) {
                openChapterNotes(currentSubject.id, nextChapter.id);
                playChimeSound("click");
              }
            }}
            disabled={!nextChapter}
            title={nextChapter ? `Next: ${nextChapter.title}` : "Last chapter"}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
