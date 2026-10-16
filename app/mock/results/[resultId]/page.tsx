"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy, CheckCircle2, XCircle, AlertCircle, Clock, ArrowLeft,
  ChevronDown, BookOpen, Layers3, Target, Sparkles, Filter, Loader2, RotateCcw
} from "lucide-react";
import { ExamResult, QuestionReview } from "@/app/lib/mock/schemas";

export default function ResultPage({ params }: { params: { resultId: string } }) {
  const resultId = params.resultId;
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<"ALL" | "CORRECT" | "INCORRECT" | "PARTIAL" | "UNATTEMPTED">("ALL");

  useEffect(() => {
    async function fetchResult() {
      try {
        setLoading(true);
        const res = await fetch(`/api/mock/attempts/results/${resultId}`);
        const data = await res.json();
        if (data.success) {
          setResult(data.result);
        } else {
          setError(data.error || "Failed to load examination result.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load result.");
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [resultId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b14] text-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-400 mb-4" />
        <h2 className="text-lg font-semibold tracking-tight">Generating Performance Report...</h2>
        <p className="text-xs text-slate-400 mt-1">Aggregating subject metrics and detailed solutions</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b14] text-white p-6">
        <div className="max-w-md w-full rounded-3xl border border-red-500/30 bg-[#0d131f] p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Result Not Found</h2>
          <p className="text-xs text-slate-400 mt-2">{error || "Could not retrieve evaluation data."}</p>
          <Link
            href="/mock"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold hover:bg-white/20 transition"
          >
            <ArrowLeft size={14} />
            <span>Return to Mock Test Hub</span>
          </Link>
        </div>
      </div>
    );
  }

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const filteredReviews = result.reviews.filter((r) => {
    const isUnattempted = !r.userSelected || r.userSelected.length === 0;
    if (reviewFilter === "CORRECT") return r.isCorrect;
    if (reviewFilter === "INCORRECT") return !r.isCorrect && !r.isPartial && !isUnattempted;
    if (reviewFilter === "PARTIAL") return r.isPartial;
    if (reviewFilter === "UNATTEMPTED") return isUnattempted;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/mock"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[.08] hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Mock Test Hub</span>
          </Link>
          <div className="text-xs text-slate-400">
            Exam ID: <span className="font-mono text-slate-300">{result.attemptId}</span>
          </div>
        </div>

        {/* Hero Scorecard */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[.12] bg-[#0c1322] p-6 sm:p-8 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200">
                <Sparkles size={13} />
                <span>Evaluation Complete</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {result.examTitle}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Official Appendix-6 scoring rules applied (Category-I +1/−0.25, Category-II +2/partial).
              </p>

              {/* Score Display */}
              <div className="mt-6 flex flex-wrap items-baseline gap-4">
                <div className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                  {result.totalScore}
                  <span className="text-xl sm:text-2xl font-normal text-slate-400"> / {result.maxMarks}</span>
                </div>
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-sm font-bold text-emerald-300">
                  {result.percentage}% Score
                </div>
                <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-3.5 py-1.5 text-sm font-bold text-blue-300">
                  {result.accuracyPercentage}% Accuracy
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span>Correct</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-white">{result.correctCount}</div>
                <div className="text-[11px] text-slate-500">Full marks awarded</div>
              </div>

              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <XCircle size={16} />
                  <span>Incorrect</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-white">{result.incorrectCount}</div>
                <div className="text-[11px] text-slate-500">Negative penalty applied</div>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
                <div className="flex items-center gap-2 text-xs text-purple-400">
                  <Layers3 size={16} />
                  <span>Partial Credit</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-white">{result.partialCount}</div>
                <div className="text-[11px] text-slate-500">Category-II partial score</div>
              </div>

              <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={16} />
                  <span>Time Taken</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-white">{formatSeconds(result.timeTakenSeconds)}</div>
                <div className="text-[11px] text-slate-500">Out of scheduled duration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section & Subject Breakdowns */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Section Summary */}
          <div className="rounded-3xl border border-white/[.1] bg-[#0c1322] p-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target size={18} className="text-blue-400" />
              <span>Section Performance</span>
            </h2>
            <div className="mt-4 space-y-3">
              {result.sections.map((sec) => (
                <div key={sec.sectionId} className="rounded-2xl border border-white/[.06] bg-white/[.02] p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">{sec.name}</span>
                    <span className="font-mono text-sm font-bold text-blue-300">
                      {sec.marksObtained} / {sec.maxMarks}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-1 text-[11px] text-center">
                    <div className="bg-emerald-500/10 text-emerald-300 p-1 rounded-lg">
                      <span className="block font-bold">{sec.correct}</span> Correct
                    </div>
                    <div className="bg-red-500/10 text-red-300 p-1 rounded-lg">
                      <span className="block font-bold">{sec.incorrect}</span> Wrong
                    </div>
                    <div className="bg-purple-500/10 text-purple-300 p-1 rounded-lg">
                      <span className="block font-bold">{sec.partial}</span> Partial
                    </div>
                    <div className="bg-white/5 text-slate-400 p-1 rounded-lg">
                      <span className="block font-bold">{sec.unattempted}</span> Skipped
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className="rounded-3xl border border-white/[.1] bg-[#0c1322] p-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-400" />
              <span>Subject Breakdown</span>
            </h2>
            <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {result.subjects.map((subj) => (
                <div key={subj.subject} className="rounded-xl border border-white/[.06] bg-white/[.02] p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{subj.subject}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {subj.correct}/{subj.totalQuestions} Correct • {subj.accuracyPercentage}% Accuracy
                    </div>
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-200">
                    {subj.marksObtained} <span className="text-[10px] text-slate-500 font-normal">/ {subj.maxMarks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Question Review & Solutions */}
        <div className="mt-10 rounded-3xl border border-white/[.1] bg-[#0c1322] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[.08] pb-5">
            <div>
              <h2 className="text-xl font-bold text-white">Solutions & Review</h2>
              <p className="text-xs text-slate-400 mt-1">
                Detailed step-by-step explanations and correct answers for all {result.reviews.length} questions.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.03] p-1 text-xs">
              {(["ALL", "CORRECT", "INCORRECT", "PARTIAL", "UNATTEMPTED"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setReviewFilter(mode)}
                  className={`rounded-lg px-2.5 py-1 font-medium transition ${
                    reviewFilter === mode
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {mode === "ALL"
                    ? `All (${result.reviews.length})`
                    : mode === "CORRECT"
                    ? `Correct (${result.correctCount})`
                    : mode === "INCORRECT"
                    ? `Wrong (${result.incorrectCount})`
                    : mode === "PARTIAL"
                    ? `Partial (${result.partialCount})`
                    : `Skipped (${result.unattemptedCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="mt-6 space-y-6">
            {filteredReviews.map((rev, idx) => {
              const q = rev.question;
              const hasAnswered = rev.userSelected && rev.userSelected.length > 0;
              const correctIndices = Array.isArray(rev.correctAnswer) ? rev.correctAnswer : [Number(rev.correctAnswer)];

              return (
                <div
                  key={rev.questionId}
                  className={`rounded-2xl border p-5 sm:p-6 transition ${
                    rev.isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/[.02]"
                      : rev.isPartial
                      ? "border-purple-500/30 bg-purple-500/[.02]"
                      : !hasAnswered
                      ? "border-white/[.08] bg-white/[.01]"
                      : "border-red-500/30 bg-red-500/[.02]"
                  }`}
                >
                  {/* Review Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[.06] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-lg">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">{q.subject}</span>
                      <span className="text-[11px] text-slate-500">• {q.topic}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rev.isCorrect ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                          <CheckCircle2 size={13} /> +{rev.marksAwarded} Marks
                        </span>
                      ) : rev.isPartial ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
                          <Layers3 size={13} /> +{rev.marksAwarded} Marks (Partial)
                        </span>
                      ) : !hasAnswered ? (
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                          Skipped (0 Marks)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-semibold text-red-300">
                          <XCircle size={13} /> {rev.marksAwarded} Marks
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {q.question}
                  </div>

                  {/* Options Comparison */}
                  {q.options && (
                    <div className="mt-4 space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = rev.userSelected.includes(optIdx);
                        const isCorrectOption = correctIndices.includes(optIdx);

                        let optClass = "border-white/[.06] bg-white/[.02] text-slate-300";
                        if (isCorrectOption) {
                          optClass = "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 font-medium";
                        } else if (isChosen && !isCorrectOption) {
                          optClass = "border-red-500/40 bg-red-500/10 text-red-200";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-start gap-3 rounded-xl border p-3 text-xs sm:text-sm ${optClass}`}
                          >
                            <span className="font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrectOption && (
                              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                                Correct Answer
                              </span>
                            )}
                            {isChosen && !isCorrectOption && (
                              <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation Box */}
                  <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-500/[.05] p-3.5 text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-blue-300 block mb-1">
                      Explanation & Working:
                    </span>
                    {rev.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
