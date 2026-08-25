import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Search,
  FileText,
  Clock,
  Download,
  Share2,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";

export const ChapterListView: React.FC = () => {
  const {
    subjects,
    selectedSubjectId,
    setActiveView,
    openChapterNotes,
    startQuizOnChapter,
    markChapterCompleted,
    toggleBookmark,
    playChimeSound,
  } = useStudy();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPublication, setSelectedPublication] = useState<string>("All");

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  if (!currentSubject) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Subject not found.</p>
        <button
          onClick={() => setActiveView("subjects")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs"
        >
          Back to Subjects
        </button>
      </div>
    );
  }

  const publications = ["All", ...Array.from(new Set(currentSubject.chapters.map((c) => c.publication)))];

  const filteredChapters = currentSubject.chapters.filter((chap) => {
    const matchesSearch =
      chap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chap.keyTopics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      chap.publication.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPub = selectedPublication === "All" || chap.publication === selectedPublication;
    return matchesSearch && matchesPub;
  });

  const completedCount = currentSubject.chapters.filter((c) => c.isCompleted).length;
  const progressPercent = Math.round((completedCount / (currentSubject.chapters.length || 1)) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Back button */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-subjects-btn"
          onClick={() => {
            setActiveView("subjects");
            playChimeSound("click");
          }}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Subjects</span>
        </button>
      </div>

      {/* Subject Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${currentSubject.colorScheme.badge}`}>
                {currentSubject.code}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentSubject.chapters.length} Curriculum Chapters
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentSubject.name} Notes & Quizzes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {currentSubject.description}
            </p>
          </div>

          {/* Progress Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[220px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Completion</span>
              <span className="font-bold text-slate-900">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              {completedCount} of {currentSubject.chapters.length} chapters marked complete
            </p>
          </div>
        </div>
      </div>

      {/* Search & Publication Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Publication filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Source:</span>
          </span>
          {publications.map((pub) => (
            <button
              key={pub}
              onClick={() => {
                setSelectedPublication(pub);
                playChimeSound("click");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedPublication === pub
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {pub}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-chapters-input"
            type="text"
            placeholder="Search chapters or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Chapter List Items */}
      <div className="space-y-3">
        {filteredChapters.map((chapter) => (
          <div
            key={chapter.id}
            id={`chapter-item-${chapter.id}`}
            className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-sm hover:shadow-md ${
              chapter.isCompleted ? "border-emerald-200/90 bg-emerald-50/10" : "border-slate-100 hover:border-slate-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left Info with Completion Checkbox */}
              <div className="flex items-start gap-3.5 flex-1">
                <button
                  id={`toggle-complete-btn-${chapter.id}`}
                  onClick={() => markChapterCompleted(chapter.id)}
                  title={chapter.isCompleted ? "Mark as unread" : "Mark as completed"}
                  className="mt-0.5 shrink-0 cursor-pointer"
                >
                  {chapter.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-500 transition-colors" />
                  )}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Chapter {chapter.chapterNumber}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                      {chapter.publication}
                    </span>
                    {chapter.edition && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {chapter.edition}
                      </span>
                    )}
                    {chapter.customUploaded && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        Uploaded Notes
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => openChapterNotes(currentSubject.id, chapter.id)}
                    className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {chapter.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {chapter.summary}
                  </p>

                  {/* Topics Tags & Stats */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {chapter.keyTopics.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100"
                      >
                        {topic}
                      </span>
                    ))}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-1">
                      <Clock className="w-3 h-3" />
                      <span>{chapter.readTimeMinutes} min</span>
                    </span>
                    <span className="text-[11px] text-slate-400">•</span>
                    <span className="text-[11px] text-slate-400">
                      {chapter.pageCount} pages
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {/* Bookmark button */}
                <button
                  id={`bookmark-btn-${chapter.id}`}
                  onClick={() => toggleBookmark(chapter.id)}
                  title={chapter.isBookmarked ? "Remove bookmark" : "Bookmark this chapter"}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    chapter.isBookmarked
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${chapter.isBookmarked ? "fill-amber-500" : ""}`} />
                </button>

                {/* Read Notes button */}
                <button
                  id={`read-notes-btn-${chapter.id}`}
                  onClick={() => {
                    openChapterNotes(currentSubject.id, chapter.id);
                    playChimeSound("click");
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-100 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Notes</span>
                </button>

                {/* AI Quiz button */}
                <button
                  id={`take-quiz-btn-${chapter.id}`}
                  onClick={() => {
                    startQuizOnChapter(currentSubject.id, chapter.id);
                    playChimeSound("click");
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Take AI Quiz</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredChapters.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No chapters found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or publication filter.</p>
        </div>
      )}
    </div>
  );
};
