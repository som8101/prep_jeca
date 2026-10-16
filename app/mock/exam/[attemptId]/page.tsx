"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExamHeader from "@/app/components/mock/ExamHeader";
import QuestionView from "@/app/components/mock/QuestionView";
import QuestionPalette from "@/app/components/mock/QuestionPalette";
import AntiCheatModal from "@/app/components/mock/AntiCheatModal";
import SubmitConfirmModal from "@/app/components/mock/SubmitConfirmModal";
import CalculatorModal from "@/app/components/mock/CalculatorModal";
import { useExamStore } from "@/app/lib/mock/store";
import { getLocalSession } from "@/app/lib/mock/idb";
import { setupAntiCheatListeners } from "@/app/lib/mock/antiCheat";
import { Loader2, AlertCircle, ArrowLeft, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "@/app/components/AuthModal";

export default function ExamPage({ params }: { params: { attemptId: string } }) {
  const router = useRouter();
  const attemptId = params.attemptId;
  const { user, loading: authLoading } = useAuth();

  const {
    initSession,
    tickTimer,
    status,
    errorMessage,
    resultId,
  } = useExamStore();

  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Initialize Exam Session (Server + IndexedDB rehydration) - only when authenticated
  useEffect(() => {
    let isMounted = true;

    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const currentUserId = user.uid;

    async function loadAttemptData() {
      try {
        setLoading(true);
        // 1. Fetch server state
        const res = await fetch(`/api/mock/attempts/${attemptId}?userId=${currentUserId}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to load exam attempt.");
        }

        const { attempt, examConfig, questions, remainingSeconds } = data;

        // 2. Cross-check with local IndexedDB (crash recovery / refresh)
        const local = await getLocalSession(attemptId);
        let finalAnswers = attempt.answers || {};
        let finalVisited = attempt.visitedQuestions || [];
        let finalQIndex = 0;
        let finalWarnings = attempt.warningsTriggered || 0;

        if (local && local.updatedAt) {
          // Merge local answers if local has updates
          finalAnswers = { ...finalAnswers, ...local.answers };
          finalVisited = Array.from(new Set([...finalVisited, ...local.visitedQuestions]));
          finalQIndex = local.currentQuestionIndex || 0;
          finalWarnings = Math.max(finalWarnings, local.warnings || 0);
        }

        if (isMounted) {
          initSession({
            attemptId,
            examConfig,
            questions,
            remainingSeconds: Math.min(remainingSeconds, local?.remainingSeconds ?? remainingSeconds),
            initialAnswers: finalAnswers,
            initialVisited: finalVisited,
            initialQuestionIndex: finalQIndex,
            warnings: finalWarnings,
          });
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setInitError(err.message || "Failed to load exam attempt.");
          setLoading(false);
        }
      }
    }

    loadAttemptData();

    return () => {
      isMounted = false;
    };
  }, [attemptId, initSession, user, authLoading]);

  // Set up 1-second countdown ticker
  useEffect(() => {
    if (status !== "ACTIVE") return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [status, tickTimer]);

  // Set up anti-cheat monitoring
  useEffect(() => {
    if (status !== "ACTIVE") return;
    const cleanup = setupAntiCheatListeners({ enabled: true });
    return cleanup;
  }, [status]);

  // Redirect to results on submit
  useEffect(() => {
    if (status === "COMPLETED" && resultId) {
      router.push(`/mock/results/${resultId}`);
    }
  }, [status, resultId, router]);

  // Auth gate if user is not logged in
  if (!authLoading && !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b14] text-white p-6">
        <div className="max-w-md w-full rounded-3xl border border-blue-500/30 bg-[#0d131f] p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30 mb-4">
            <Lock size={30} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Authentication Required</h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            You must be signed in to take this Computer-Based Test (CBT). Your session, responses, and score reports will be saved to your account.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-xs font-bold text-white shadow-glow transition hover:bg-blue-400"
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
          customSubtitle="Sign in to continue your CBT mock test"
        />
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b14] text-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-400 mb-4" />
        <h2 className="text-lg font-semibold tracking-tight">Initializing Examination Environment...</h2>
        <p className="text-xs text-slate-400 mt-1">Verifying server clock, questions, and session security</p>
      </div>
    );
  }

  if (initError || errorMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b14] text-white p-6">
        <div className="max-w-md w-full rounded-3xl border border-red-500/30 bg-[#0d131f] p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Unable to Load Exam</h2>
          <p className="text-xs text-slate-400 mt-2">{initError || errorMessage}</p>
          <button
            onClick={() => router.push("/mock")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold hover:bg-white/20 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Mock Test Hub</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#070b14] text-white select-none">
      <ExamHeader />

      <div className="flex flex-1 overflow-hidden p-3 sm:p-4 gap-4 max-w-7xl mx-auto w-full">
        {/* Main Question Panel (70% on desktop) */}
        <div className="flex-1 rounded-2xl border border-white/[.1] bg-[#090f1d] p-4 sm:p-6 overflow-y-auto">
          <QuestionView />
        </div>

        {/* Right Palette Panel (30% on desktop, collapsible on mobile) */}
        <div className="hidden lg:block w-80 shrink-0 h-full">
          <QuestionPalette />
        </div>
      </div>

      {/* Anti-Cheat Modal */}
      <AntiCheatModal />

      {/* Final Submit Confirmation Modal */}
      <SubmitConfirmModal />

      {/* Floating Scientific Calculator Modal */}
      <CalculatorModal />
    </main>
  );
}
