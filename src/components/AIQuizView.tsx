import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Trophy,
  Flame,
  Award,
  Loader2,
  Volume2,
  Zap,
  Check,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { QuizQuestion, QuizResult } from "../types";

export const AIQuizView: React.FC = () => {
  const {
    subjects,
    selectedSubjectId,
    selectedChapterId,
    setActiveView,
    recordQuizResult,
    openChapterNotes,
    playChimeSound,
    triggerCelebration,
  } = useStudy();

  // Quiz setup states
  const [quizState, setQuizState] = useState<"config" | "loading" | "in-progress" | "summary">("config");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [enableTimer, setEnableTimer] = useState<boolean>(true);
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);

  // Active quiz execution states
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [isOptionLocked, setIsOptionLocked] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [generationSource, setGenerationSource] = useState<string>("gemini");

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const currentChapter = currentSubject?.chapters.find((c) => c.id === selectedChapterId) || currentSubject?.chapters[0];

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (quizState === "in-progress" && enableTimer) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizState, enableTimer]);

  if (!currentSubject || !currentChapter) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Chapter not found.</p>
        <button
          onClick={() => setActiveView("subjects")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs"
        >
          Back to Subjects
        </button>
      </div>
    );
  }

  // Fetch AI Quiz from Gemini endpoint
  const handleStartQuiz = async () => {
    setQuizState("loading");
    setTimerSeconds(0);
    playChimeSound("click");

    try {
      const response = await fetch("/api/gemini/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: currentSubject.name,
          chapterName: currentChapter.title,
          publication: currentChapter.publication,
          contentSummary: currentChapter.summary + " " + currentChapter.sections.map((s) => s.content).join(" "),
          questionCount,
          difficulty,
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        // Ensure options and correct answer index are randomized across A, B, C, D
        const formattedQuestions: QuizQuestion[] = data.questions.map((q: any) => {
          const originalOptions = Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"];
          const correctText = originalOptions[q.correctAnswerIndex ?? 0];
          // Deterministic/random shuffle
          const shuffledOptions = [...originalOptions].sort(() => Math.random() - 0.5);
          const newCorrectIndex = shuffledOptions.indexOf(correctText);

          return {
            ...q,
            options: shuffledOptions,
            correctAnswerIndex: newCorrectIndex !== -1 ? newCorrectIndex : 0,
          };
        });

        setQuestions(formattedQuestions);
        setSelectedAnswers(new Array(formattedQuestions.length).fill(null));
        setCurrentIndex(0);
        setIsOptionLocked(false);
        setGenerationSource(data.source || "gemini");
        setQuizState("in-progress");
      } else {
        throw new Error("Failed to load questions");
      }
    } catch (error) {
      console.error("Quiz start error:", error);
      // Fallback questions generated
      setQuizState("config");
    }
  };

  // Option select handler
  const handleSelectOption = (optionIndex: number) => {
    if (isOptionLocked) return;

    const updated = [...selectedAnswers];
    updated[currentIndex] = optionIndex;
    setSelectedAnswers(updated);
    setIsOptionLocked(true);

    const isCorrect = optionIndex === questions[currentIndex].correctAnswerIndex;
    if (isCorrect) {
      playChimeSound("correct");
    } else {
      playChimeSound("incorrect");
    }
  };

  const handleNextQuestion = () => {
    playChimeSound("click");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsOptionLocked(selectedAnswers[currentIndex + 1] !== null);
    } else {
      // Complete quiz
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    const score = questions.reduce((acc, q, idx) => {
      return acc + (selectedAnswers[idx] === q.correctAnswerIndex ? 1 : 0);
    }, 0);

    const percentage = Math.round((score / questions.length) * 100);

    const result: QuizResult = {
      id: `quiz_${Date.now()}`,
      chapterId: currentChapter.id,
      chapterTitle: currentChapter.title,
      subjectId: currentSubject.id,
      subjectName: currentSubject.name,
      publication: currentChapter.publication,
      score,
      total: questions.length,
      percentage,
      timeTakenSeconds: timerSeconds,
      timestamp: new Date().toISOString(),
      difficulty,
      questions,
      userAnswers: selectedAnswers.map((a) => (a !== null ? a : -1)),
    };

    recordQuizResult(result);
    setQuizState("summary");

    if (percentage >= 80) {
      triggerCelebration("quiz-perfect");
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 1. Setup / Config Screen
  if (quizState === "config") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <button
          onClick={() => {
            openChapterNotes(currentSubject.id, currentChapter.id);
            playChimeSound("click");
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {currentChapter.title} Notes</span>
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Chapter Assessment
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Synthesizing key conceptual questions for <strong>{currentChapter.title}</strong> ({currentChapter.publication}).
            </p>
          </div>

          {/* Config options */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            {/* Question count selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Number of Questions
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => {
                      setQuestionCount(cnt);
                      playChimeSound("click");
                    }}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      questionCount === cnt
                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["Easy", "Medium", "Hard"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setDifficulty(lvl);
                      playChimeSound("click");
                    }}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      difficulty === lvl
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles (Timer & Instant Feedback) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Quiz Timer</span>
                <input
                  type="checkbox"
                  checked={enableTimer}
                  onChange={(e) => setEnableTimer(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Instant Explanation</span>
                <input
                  type="checkbox"
                  checked={instantFeedback}
                  onChange={(e) => setInstantFeedback(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Start Quiz Action */}
          <button
            id="start-ai-quiz-btn"
            onClick={handleStartQuiz}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate & Begin Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading Screen
  if (quizState === "loading") {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mx-auto">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Generating AI Questions with Gemini
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Reading chapter notes for <strong>{currentChapter.title}</strong>, extracting core formulas and constructing multiple choice questions...
        </p>
      </div>
    );
  }

  // 3. In-Progress Question Card Screen
  if (quizState === "in-progress" && questions.length > 0) {
    const currentQ = questions[currentIndex];
    const userSelected = selectedAnswers[currentIndex];
    const isAnswered = userSelected !== null;
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20">
        {/* Top Header: Progress Bar & Timer */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-medium">{currentQ.subtopic}</span>
            </div>

            {enableTimer && (
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* MCQ Question Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {currentQ.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((option, oIdx) => {
              const isChosen = userSelected === oIdx;
              const isCorrect = oIdx === currentQ.correctAnswerIndex;
              const showResult = isAnswered && instantFeedback;

              let btnStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";
              let badgeStyle = "bg-slate-100 text-slate-600";

              if (showResult) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs";
                  badgeStyle = "bg-emerald-600 text-white";
                } else if (isChosen) {
                  btnStyle = "bg-rose-50 border-rose-400 text-rose-900 shadow-xs";
                  badgeStyle = "bg-rose-600 text-white";
                } else {
                  btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                }
              } else if (isChosen) {
                btnStyle = "bg-blue-50 border-blue-500 text-blue-900 shadow-xs";
                badgeStyle = "bg-blue-600 text-white";
              }

              return (
                <button
                  key={oIdx}
                  id={`quiz-option-${oIdx}`}
                  onClick={() => handleSelectOption(oIdx)}
                  disabled={isOptionLocked}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-medium cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${badgeStyle}`}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {showResult && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {showResult && isChosen && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Explanation Feedback Box */}
          {isAnswered && instantFeedback && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                userSelected === currentQ.correctAnswerIndex
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                  : "bg-amber-50/70 border-amber-200 text-amber-950"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Concept Explanation & Rationale</span>
              </div>
              <p>{currentQ.explanation}</p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex((prev) => prev - 1);
                  setIsOptionLocked(true);
                }
              }}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              Previous
            </button>

            <button
              id="quiz-next-question-btn"
              onClick={handleNextQuestion}
              disabled={!isAnswered}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentIndex === questions.length - 1 ? "Finish Assessment" : "Next Question"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Score Summary Screen
  if (quizState === "summary") {
    const score = questions.reduce((acc, q, idx) => {
      return acc + (selectedAnswers[idx] === q.correctAnswerIndex ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-16">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6 text-center">
          {/* Trophy & Badge Icon */}
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-xs">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold border-2 border-white">
              +150 XP
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {percentage >= 80 ? "Outstanding Mastery!" : percentage >= 60 ? "Great Effort!" : "Keep Practicing!"}
            </h1>
            <p className="text-xs text-slate-500">
              Assessment completed for <strong>{currentChapter.title}</strong>
            </p>
          </div>

          {/* Score Stats Pill Row */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Score</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {score} / {questions.length}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Accuracy</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600">
                {percentage}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Time</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="retake-quiz-btn"
              onClick={() => {
                setQuizState("config");
                playChimeSound("click");
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>

            <button
              id="return-to-notes-btn"
              onClick={() => {
                openChapterNotes(currentSubject.id, currentChapter.id);
                playChimeSound("click");
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Return to Chapter Notes</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 px-1">Detailed Question Breakdown</h3>

          {questions.map((q, qIdx) => {
            const userAnswer = selectedAnswers[qIdx];
            const isCorrect = userAnswer === q.correctAnswerIndex;

            return (
              <div
                key={qIdx}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs space-y-3 ${
                  isCorrect ? "border-emerald-200" : "border-rose-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 mt-0.5">
                      Q{qIdx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{q.question}</h4>
                  </div>
                  {isCorrect ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      Correct
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 shrink-0">
                      Incorrect
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-slate-600">
                    Your Answer:{" "}
                    <strong className={isCorrect ? "text-emerald-600" : "text-rose-600"}>
                      {userAnswer !== null && userAnswer >= 0 ? q.options[userAnswer] : "Skipped"}
                    </strong>
                  </p>
                  {!isCorrect && (
                    <p className="text-slate-600">
                      Correct Answer:{" "}
                      <strong className="text-emerald-700">{q.options[q.correctAnswerIndex]}</strong>
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl leading-relaxed">
                  💡 {q.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
