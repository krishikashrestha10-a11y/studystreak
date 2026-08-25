import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  Search,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
  Flame,
  Zap,
  FlaskConical,
  Calculator,
  Dna,
  Code2,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { Subject } from "../types";

export const SubjectsView: React.FC = () => {
  const { subjects, setSelectedSubjectId, setActiveView, playChimeSound } = useStudy();
  const [searchQuery, setSearchQuery] = useState("");

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return <Zap className="w-5 h-5" />;
      case "FlaskConical":
        return <FlaskConical className="w-5 h-5" />;
      case "Calculator":
        return <Calculator className="w-5 h-5" />;
      case "Dna":
        return <Dna className="w-5 h-5" />;
      case "Code2":
        return <Code2 className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const filteredSubjects = subjects.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.publications.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Subjects
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Select a subject to access chapter-wise comprehensive study notes and AI-generated quizzes.
          </p>
        </div>

        {/* Search box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-subjects-input"
            type="text"
            placeholder="Search subjects or publications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((sub) => {
          const completedCount = sub.chapters.filter((c) => c.isCompleted).length;
          const totalChapters = sub.chapters.length;
          const progressPercent = Math.round((completedCount / (totalChapters || 1)) * 100);

          return (
            <div
              key={sub.id}
              id={`subject-card-${sub.id}`}
              onClick={() => {
                setSelectedSubjectId(sub.id);
                setActiveView("chapter-list");
                playChimeSound("click");
              }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
            >
              {/* Card Header with soft banner tint */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl bg-white shadow-xs ${sub.colorScheme.accent}`}>
                    {getSubjectIcon(sub.iconName)}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sub.colorScheme.badge}`}>
                    {sub.code}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mt-4 group-hover:text-blue-600 transition-colors">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {sub.description}
                </p>
              </div>

              {/* Card Body with Publications & Stats */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Reference Publications
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sub.publications.map((pub, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/80"
                      >
                        {pub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Chapter Progress</span>
                    <span className="font-bold text-slate-800">
                      {completedCount} / {totalChapters} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                  <span>Explore Chapters & AI Quizzes</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No subjects found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};
