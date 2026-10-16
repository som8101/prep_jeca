"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, XCircle, Sparkles, BookOpen, RotateCcw,
  ChevronRight, HelpCircle, Layers3, Loader2, ArrowRight, Lock, LogIn
} from "lucide-react";
import { ClientQuestion } from "@/app/lib/mock/schemas";
import { markPracticeQuestionSeen, getSeenPracticeQuestionIds } from "@/app/lib/mock/idb";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "@/app/components/AuthModal";

const SUBJECTS = [
  "All",
  "C Programming",
  "Object Oriented Programming",
  "Unix",
  "Data Structure",
  "Introduction of Computers",
  "Operating System",
  "Computer Network",
  "Database Management System",
  "Software Engineering",
  "Machine Learning",
];

export default function PracticePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelected, setUserSelected] = useState<(number | string)[]>([]);
  const [checkResult, setCheckResult] = useState<{
    isCorrect: boolean;
    correctAnswer: any;
    explanation: string;
    marks: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [stats, setStats] = useState({ practiced: 0, correct: 0 });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Load questions for selected subject when authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchQuestions() {
      setLoading(true);
      try {
        const seenIds = await getSeenPracticeQuestionIds();
        const url = `/api/mock/practice/questions?subject=${encodeURIComponent(
          selectedSubject
        )}&limit=15&unseenIds=${seenIds.join(",")}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.questions) {
          setQuestions(data.questions);
          setCurrentIndex(0);
          setUserSelected([]);
          setCheckResult(null);
        }
      } catch (err) {
        console.error("Practice fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [selectedSubject, user, authLoading]);

  const currentQ = questions[currentIndex];
  const isMulti = currentQ?.type === "MCQ_MULTI";

  const handleSelectOption = (idx: number) => {
    if (checkResult) return; // Locked once checked
    if (isMulti) {
      setUserSelected((prev) =>
        prev.includes(idx) ? prev.filter((v) => v !== idx) : [...prev, idx]
      );
    } else {
      setUserSelected([idx]);
    }
  };

  const handleCheckAnswer = async () => {
    if (!currentQ || userSelected.length === 0 || checking) return;
    setChecking(true);
    try {
      const res = await fetch("/api/mock/practice/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQ.id,
          userSelected,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCheckResult(data);
        // Track seen question in IndexedDB
        markPracticeQuestionSeen(currentQ.id);

        setStats((prev) => ({
          practiced: prev.practiced + 1,
          correct: data.isCorrect ? prev.correct + 1 : prev.correct,
        }));
      }
    } catch (err) {
      console.error("Check error:", err);
    } finally {
      setChecking(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserSelected([]);
      setCheckResult(null);
    } else {
      // Reload fresh batch
      setSelectedSubject((prev) => (prev === "All" ? "All" : prev));
    }
  };

  if (!authLoading && !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#070b14] text-white p-6">
        <div className="max-w-md w-full rounded-3xl border border-emerald-500/30 bg-[#0d131f] p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30 mb-4">
            <Lock size={30} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Authentication Required</h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Please sign in or use one-click Instant Demo Login to practice topic-wise questions, track your solved concepts, and unlock in-depth solutions.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-glow transition hover:bg-emerald-500"
            >
              <LogIn size={15} />
              <span>Sign In / Demo Login</span>
            </button>
            <button
              onClick={() => router.push("/mock")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/[.08] hover:text-white transition"
            >
              <ArrowLeft size={14} />
              <span>Back to Mock Test Hub</span>
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          customSubtitle="Sign in to launch topic-wise practice questions"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[.08] pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/mock"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[.06] hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>Mock Hub</span>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Topic-Wise Practice Mode</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                  Untimed
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Instant solution explanations & no-repeat question selection
              </p>
            </div>
          </div>

          {/* Session Quick Stats */}
          <div className="flex items-center gap-3 text-xs">
            <div className="rounded-xl border border-white/[.08] bg-white/[.02] px-3 py-1.5 text-slate-300">
              Practiced: <span className="font-bold text-white">{stats.practiced}</span>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
              Accuracy:{" "}
              <span className="font-bold text-emerald-200">
                {stats.practiced > 0 ? Math.round((stats.correct / stats.practiced) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SUBJECTS.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedSubject === subj
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                  : "border border-white/[.08] bg-white/[.03] text-slate-400 hover:text-white"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Question Runner Card */}
        {loading ? (
          <div className="mt-8 flex h-72 items-center justify-center rounded-3xl border border-white/[.08] bg-[#0c1322]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : !currentQ ? (
          <div className="mt-8 rounded-3xl border border-white/[.08] bg-[#0c1322] p-8 text-center text-slate-400">
            No questions available for this filter. Try selecting "All".
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-white/[.12] bg-[#0c1322] p-6 sm:p-8 shadow-2xl">
            {/* Meta bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.06] pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-300 bg-blue-500/15 px-2.5 py-1 rounded-lg">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-slate-300 font-medium">{currentQ.subject}</span>
                <span className="text-[11px] text-slate-500">• {currentQ.topic}</span>
              </div>

              <div className="text-xs font-medium text-slate-400">
                {isMulti ? "Category-II (Multiple Correct)" : "Category-I (Single Correct)"}
              </div>
            </div>

            {/* Question Text */}
            <div className="py-6 text-base sm:text-lg font-medium text-slate-100 leading-relaxed whitespace-pre-wrap">
              {currentQ.question}
            </div>

            {/* Options */}
            {currentQ.options && (
              <div className="space-y-3 pb-4">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = userSelected.includes(idx);
                  const isCorrectAnswer =
                    checkResult &&
                    (Array.isArray(checkResult.correctAnswer)
                      ? checkResult.correctAnswer.includes(idx)
                      : Number(checkResult.correctAnswer) === idx);

                  let optClass = "border-white/[.08] bg-[#0e1628] hover:border-white/20";
                  if (checkResult) {
                    if (isCorrectAnswer) {
                      optClass = "border-emerald-500/60 bg-emerald-500/15 text-emerald-200";
                    } else if (isSelected && !isCorrectAnswer) {
                      optClass = "border-red-500/60 bg-red-500/15 text-red-200";
                    }
                  } else if (isSelected) {
                    optClass = "border-blue-500 bg-blue-500/15 text-white";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={Boolean(checkResult)}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full flex items-start gap-3.5 rounded-2xl border p-4 text-left transition ${optClass}`}
                    >
                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-${
                          isMulti ? "md" : "full"
                        } text-xs font-bold ${
                          isSelected || isCorrectAnswer
                            ? "bg-blue-500 text-white"
                            : "border border-white/20 bg-white/5 text-slate-300"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="text-sm sm:text-base leading-relaxed flex-1">{opt}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Explanation card (Revealed after Check Answer) */}
            {checkResult && (
              <div
                className={`mt-6 rounded-2xl border p-4 text-xs sm:text-sm leading-relaxed animate-in fade-in duration-200 ${
                  checkResult.isCorrect
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-2">
                  {checkResult.isCorrect ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Correct Answer!</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-amber-400" />
                      <span>Incorrect Response</span>
                    </>
                  )}
                </div>
                <div className="text-slate-300 whitespace-pre-wrap">{checkResult.explanation}</div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="mt-8 flex items-center justify-between border-t border-white/[.08] pt-4">
              <button
                type="button"
                onClick={() => {
                  setUserSelected([]);
                  setCheckResult(null);
                }}
                disabled={Boolean(checkResult) || userSelected.length === 0}
                className="text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30"
              >
                Clear Selection
              </button>

              <div className="flex items-center gap-3">
                {!checkResult ? (
                  <button
                    type="button"
                    disabled={userSelected.length === 0 || checking}
                    onClick={handleCheckAnswer}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-glow transition hover:bg-blue-400 disabled:opacity-40"
                  >
                    {checking ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>Check Answer</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-glow transition hover:bg-emerald-500"
                  >
                    <span>Next Question</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        customSubtitle="Sign in to launch topic-wise practice questions"
      />
    </main>
  );
}
