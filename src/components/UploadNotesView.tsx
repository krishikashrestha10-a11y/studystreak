import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  Edit3,
  Loader2,
  AlertCircle,
  FileUp,
  X,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";

export const UploadNotesView: React.FC = () => {
  const { subjects, addNewChapter, setActiveView, playChimeSound, triggerCelebration } = useStudy();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "physics");
  const [chapterTitle, setChapterTitle] = useState<string>("");
  const [chapterNumber, setChapterNumber] = useState<number>(6);
  const [publicationName, setPublicationName] = useState<string>("Arihant Publications");
  const [edition, setEdition] = useState<string>("2026 Edition");
  const [topicsInput, setTopicsInput] = useState<string>("Core Laws, Solved Numericals, High-Yield Formulas");
  const [rawContent, setRawContent] = useState<string>(
    `# Chapter Overview\nThis chapter delves into key theoretical foundations, mathematical derivations, and experimental validations.\n\n## 1. Key Principles\nAll observed phenomena follow strict conservation laws and boundary conditions.\n\n## 2. Important Formulas\n- Standard Relation: Y = mX + C\n- Energy Equation: E = h·ν\n- Efficiency: η = (W_out / Q_in) × 100%`
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFileName(file.name);
    playChimeSound("click");

    // Auto extract sample text or title
    if (!chapterTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setChapterTitle(cleanName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // AI Auto-Format with Gemini
  const handleAiAutoFormat = async () => {
    if (!chapterTitle.trim()) return;
    setIsAiProcessing(true);

    try {
      const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
      const response = await fetch("/api/gemini/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterName: chapterTitle,
          subject: currentSubject?.name || "Science",
          rawNotes: rawContent,
        }),
      });

      const data = await response.json();
      if (data.success && data.summary) {
        setRawContent(
          `# ${chapterTitle} - Summary & Highlights\n${data.summary}\n\n## Core Revision Points\n${(data.keyPoints || []).map((p: string) => `- ${p}`).join("\n")}\n\n## Key Formulas\n${(data.formulae || ["Standard Governing Law: F = ma"]).map((f: string) => `- ${f}`).join("\n")}`
        );
        playChimeSound("correct");
      }
    } catch (e) {
      console.error("AI auto format error", e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim()) return;

    const topics = topicsInput.split(",").map((t) => t.trim()).filter(Boolean);

    addNewChapter({
      subjectId: selectedSubjectId,
      chapterNumber: Number(chapterNumber) || 1,
      title: chapterTitle.trim(),
      publication: publicationName.trim() || "Student Contributed",
      edition: edition.trim() || "Latest Edition",
      pageCount: Math.floor(Math.random() * 20) + 15,
      readTimeMinutes: 20,
      keyTopics: topics.length > 0 ? topics : ["General Principles", "Exam Highlights"],
      summary: rawContent.slice(0, 300) + "...",
      sections: [
        {
          title: "1. Core Principles & Concept Highlights",
          content: rawContent,
          formulae: ["Standard Governing Law: F = m·a", "Efficiency: η = W / Q"],
          keyPoints: topics,
        },
      ],
      formulaCheatsheet: ["Standard Equation: E = mc²", "Power: P = V · I"],
    });

    setIsSuccess(true);
    triggerCelebration("badge");
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Notes Published Successfully!
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          <strong>"{chapterTitle}"</strong> has been indexed with AI and added to the{" "}
          <strong>{subjects.find((s) => s.id === selectedSubjectId)?.name}</strong> chapter catalog.
        </p>

        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => {
              setIsSuccess(false);
              setChapterTitle("");
              setUploadedFileName(null);
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Upload Another Document
          </button>
          <button
            onClick={() => setActiveView("subjects")}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            View in Curriculum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload & Index Study Notes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Share chapter notes from NCERT, Arihant, RD Sharma or your own handwritten PDF notes.
        </p>
      </div>

      {/* Main Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Subject & Publication Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target Subject *
            </label>
            <select
              id="upload-subject-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Publication Name *
            </label>
            <input
              id="upload-publication-input"
              type="text"
              required
              placeholder="e.g., NCERT, Arihant, HC Verma, Handcrafted"
              value={publicationName}
              onChange={(e) => setPublicationName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Chapter Title & Number */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chapter Title *
            </label>
            <input
              id="upload-chapter-title-input"
              type="text"
              required
              placeholder="e.g., Magnetism and Matter, Dual Nature of Radiation"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chapter Number
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={chapterNumber}
              onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Drag and Drop File Upload Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Upload PDF / Document
          </label>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-6 text-center transition-colors cursor-pointer group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />

            <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-blue-600 mx-auto mb-2 transition-colors" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              Drag and drop your PDF notes here, or <span className="text-blue-600">browse files</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Supports PDF, DOCX, TXT (Max 25MB)</p>

            {uploadedFileName && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                <FileText className="w-3.5 h-3.5" />
                <span>{uploadedFileName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Key Topics Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Key Topics (Comma Separated)
          </label>
          <input
            type="text"
            placeholder="e.g., Biot-Savart Law, Magnetic Permeability, Solenoids"
            value={topicsInput}
            onChange={(e) => setTopicsInput(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Notes Editor & Preview Tabs */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  activeTab === "edit" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Edit Notes Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  activeTab === "preview" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Preview Document
              </button>
            </div>

            {/* AI Auto-Format Button */}
            <button
              type="button"
              id="ai-auto-format-btn"
              onClick={handleAiAutoFormat}
              disabled={isAiProcessing || !chapterTitle}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer"
            >
              {isAiProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>AI Auto-Format</span>
            </button>
          </div>

          {activeTab === "edit" ? (
            <textarea
              rows={8}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Paste or write formatted chapter notes, definitions, formulas..."
              className="w-full p-4 font-mono text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
            />
          ) : (
            <div className="p-5 rounded-2xl border border-slate-200 bg-white min-h-[160px] space-y-3">
              <h3 className="text-lg font-bold text-slate-900">{chapterTitle || "Untitled Chapter"}</h3>
              <p className="text-xs text-slate-500">
                Source: {publicationName} ({edition})
              </p>
              <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed border-t border-slate-100 pt-2">
                {rawContent}
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          id="submit-notes-btn"
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload & Add to Subject Notes</span>
        </button>
      </form>
    </div>
  );
};
