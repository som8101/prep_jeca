"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Code2, Clock, CheckCircle2, Award, Play, BookOpen, Layers3,
  Sparkles, ArrowRight, ShieldCheck, BarChart3, RotateCcw, Loader2, LogIn, Lock
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "@/app/components/AuthModal";
import UserMenu from "@/app/components/UserMenu";

export default function MockHubPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingExamId, setPendingExamId] = useState<string | null>(null);
  const [pendingPractice, setPendingPractice] = useState(false);

  useEffect(() => {
    async function loadHub() {
      try {
        setLoading(true);
        const userId = user?.uid || "all";
        const res = await fetch(`/api/mock/exams?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setExams(data.exams || []);
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error("Hub fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHub();
  }, [user]);

  const handleStartExam = async (examConfigId: string, customUserId?: string) => {
    const activeUserId = customUserId || user?.uid;
    if (!activeUserId) {
      setPendingExamId(examConfigId);
      setAuthModalOpen(true);
      return;
    }

    try {
      setStartingId(examConfigId);
      const res = await fetch("/api/mock/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examConfigId,
          userId: activeUserId,
        }),
      });
      const data = await res.json();
      if (data.success && data.attemptId) {
        router.push(`/mock/exam/${data.attemptId}`);
      }
    } catch (err) {
      console.error("Start exam error:", err);
    } finally {
      setStartingId(null);
    }
  };

  const handleAuthSuccess = () => {
    if (pendingExamId) {
      const examId = pendingExamId;
      setPendingExamId(null);
      // Retrieve newly authenticated or demo user ID
      const demoUser = typeof window !== "undefined" ? localStorage.getItem("jeca_demo_user") : null;
      const uid = user?.uid || (demoUser ? JSON.parse(demoUser).uid : "student");
      handleStartExam(examId, uid);
    } else if (pendingPractice) {
      setPendingPractice(false);
      router.push("/mock/practice");
    }
  };

  const fullMocks = exams.filter((e) => e.category === "FULL_MOCK");
  const sectionalMocks = exams.filter((e) => e.category === "SECTIONAL");

  return (
    <main className="min-h-screen bg-[#070b14] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Navigation & Brand */}
        <div className="flex items-center justify-between border-b border-white/[.08] pb-6 mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/30">
              <Code2 size={21} />
            </div>
            <div>
              <div className="font-semibold tracking-tight text-white">
                JECA PrepHub <span className="text-blue-400">Mock Engine</span>
              </div>
              <div className="text-[10px] uppercase tracking-[.22em] text-slate-500">
                Official CBT Simulation
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  setPendingPractice(true);
                  setAuthModalOpen(true);
                } else {
                  router.push("/mock/practice");
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[.08] hover:text-white"
            >
              <BookOpen size={14} className="text-emerald-400" />
              <span>Topic Practice</span>
            </button>
            <UserMenu
              onOpenAuth={() => setAuthModalOpen(true)}
              completedCount={0}
              totalTopics={119}
            />
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/[.02] px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Back to Guide
            </Link>
          </div>
        </div>

        {/* Unauthenticated Notification Banner */}
        {!user && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/[.08] p-4 text-xs sm:text-sm text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Lock size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Sign In Required to Attempt Mock Tests:</span>{" "}
                <span className="text-slate-300">
                  Please sign in or use one-click Instant Demo Login to start your exam, track scores, and unlock detailed answer solutions.
                </span>
              </div>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white shadow-glow transition hover:bg-blue-400 shrink-0 text-xs"
            >
              <LogIn size={14} />
              <span>Sign In / Demo Login</span>
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[.1] bg-[#0c1322] p-6 sm:p-10 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-3.5 py-1 text-xs font-medium text-blue-200">
              <Sparkles size={14} />
              <span>Realistic CBT Testing Engine</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Master the WBJEEB JECA 2026 Examination
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
              Experience the actual exam environment with server-anchored timers, Category-I & II scoring rules, IndexedDB autosave, and comprehensive solutions.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                100 Questions (80 Cat-I + 20 Cat-II)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Category-II Partial Credit Scoring
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Instant Crash Recovery
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Full-Length Mocks */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Award size={20} className="text-blue-400" />
                <span>Full-Length Mock Examinations</span>
              </h2>
              <p className="text-xs text-slate-400">
                120 minutes • 100 questions • 120 marks • Strict CBT timing
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {fullMocks.map((exam) => (
              <div
                key={exam.id}
                className="group relative rounded-2xl border border-white/[.1] bg-[#0c1322] p-6 transition hover:border-blue-500/40 hover:bg-[#0f172a]"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-blue-500/15 p-3 text-blue-300 ring-1 ring-blue-400/20">
                    <Code2 size={22} />
                  </div>
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-[11px] font-bold text-blue-300">
                    {exam.durationMinutes} Mins
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-white group-hover:text-blue-300 transition">
                  {exam.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {exam.description}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/[.06] pt-4 text-center text-xs">
                  <div>
                    <span className="block font-bold text-white text-sm">{exam.totalQuestions}</span>
                    <span className="text-[10px] text-slate-500">Questions</span>
                  </div>
                  <div>
                    <span className="block font-bold text-white text-sm">{exam.totalMarks}</span>
                    <span className="text-[10px] text-slate-500">Max Marks</span>
                  </div>
                  <div>
                    <span className="block font-bold text-white text-sm">{exam.sections.length}</span>
                    <span className="text-[10px] text-slate-500">Sections</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={startingId === exam.id}
                  onClick={() => handleStartExam(exam.id)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-xs font-bold text-white shadow-glow transition hover:bg-blue-400 disabled:opacity-50"
                >
                  {!user ? (
                    <>
                      <Lock size={14} className="text-amber-300" />
                      <span>Login to Start Mock Test</span>
                    </>
                  ) : startingId === exam.id ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Starting CBT Session...</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} className="fill-white" />
                      <span>Start Full Mock Test</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Sectional & Practice Tests */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers3 size={20} className="text-purple-400" />
                <span>Sectional & Topic Practice</span>
              </h2>
              <p className="text-xs text-slate-400">
                Subject-specific tests to build speed and accuracy
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {sectionalMocks.map((exam) => (
              <div
                key={exam.id}
                className="rounded-2xl border border-white/[.1] bg-[#0c1322] p-6 transition hover:border-purple-500/40 hover:bg-[#0f172a]"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-purple-500/15 p-3 text-purple-300 ring-1 ring-purple-400/20">
                    <Layers3 size={22} />
                  </div>
                  <span className="rounded-full bg-purple-500/15 px-3 py-1 text-[11px] font-bold text-purple-300">
                    {exam.durationMinutes} Mins
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-white">
                  {exam.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {exam.description}
                </p>

                <button
                  type="button"
                  disabled={startingId === exam.id}
                  onClick={() => handleStartExam(exam.id)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/10 py-2.5 text-xs font-bold text-purple-300 transition hover:bg-purple-500 hover:text-white"
                >
                  {!user ? (
                    <>
                      <Lock size={14} className="text-amber-300" />
                      <span>Login to Start Sectional Test</span>
                    </>
                  ) : startingId === exam.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <Play size={14} />
                      <span>Start Sectional Test</span>
                    </>
                  )}
                </button>
              </div>
            ))}

            {/* Topic Practice Card */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.03] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-emerald-500/15 p-3 text-emerald-300 ring-1 ring-emerald-400/20">
                    <BookOpen size={22} />
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                    Untimed
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-white">
                  Topic-Wise Practice Runner
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Practice individual subjects (Data Structures, Unix, DBMS, etc.) at your own pace with instant feedback and zero repeated questions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    setPendingPractice(true);
                    setAuthModalOpen(true);
                  } else {
                    router.push("/mock/practice");
                  }
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-glow"
              >
                {!user ? (
                  <>
                    <Lock size={14} className="text-amber-300" />
                    <span>Login to Practice Topics</span>
                  </>
                ) : (
                  <>
                    <span>Launch Practice Mode</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Recent Attempts History */}
        {history.length > 0 && (
          <div className="mt-12 rounded-3xl border border-white/[.1] bg-[#0c1322] p-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-blue-400" />
              <span>Your Recent Attempt History</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[.08] text-slate-400">
                    <th className="pb-3 font-semibold">Test Name</th>
                    <th className="pb-3 font-semibold">Score</th>
                    <th className="pb-3 font-semibold">Accuracy</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[.04]">
                  {history.map((h) => (
                    <tr key={h.id} className="text-slate-300 hover:bg-white/[.02]">
                      <td className="py-3 font-medium text-white">{h.examTitle}</td>
                      <td className="py-3 font-mono font-bold text-blue-300">
                        {h.totalScore} / {h.maxMarks} ({h.percentage}%)
                      </td>
                      <td className="py-3 font-mono text-emerald-400">{h.accuracyPercentage}%</td>
                      <td className="py-3 text-slate-500">
                        {new Date(h.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/mock/results/${h.id}`}
                          className="rounded-lg bg-white/[.05] px-3 py-1 font-semibold text-slate-300 hover:text-white hover:bg-white/10"
                        >
                          Review Solutions
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal for login requirement */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingExamId(null);
          setPendingPractice(false);
        }}
        onSuccess={handleAuthSuccess}
        customSubtitle={
          pendingExamId
            ? "Sign in to start your official CBT mock examination"
            : pendingPractice
            ? "Sign in to launch topic-wise practice questions"
            : "Sign in to track your test history and review solutions"
        }
      />
    </main>
  );
}
