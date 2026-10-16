"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, X, Send, Loader2 } from "lucide-react";
import { useExamStore } from "@/app/lib/mock/store";

export default function SubmitConfirmModal() {
  const router = useRouter();
  const {
    showSubmitModal,
    setShowSubmitModal,
    questions,
    answers,
    submitExam,
    status,
  } = useExamStore();

  const [submitting, setSubmitting] = useState(false);

  if (!showSubmitModal) return null;

  const total = questions.length;
  let answered = 0;
  let markedReview = 0;

  for (const q of questions) {
    const a = answers[q.id];
    if (a?.selected && a.selected.length > 0) answered++;
    if (a?.markedForReview) markedReview++;
  }

  const unattempted = total - answered;

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    const resultId = await submitExam(false);
    if (resultId) {
      router.push(`/mock/results/${resultId}`);
    } else {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-white/[.15] bg-[#0c1322] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30">
              <Send size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Submit Examination
              </h3>
              <p className="text-xs text-slate-400">Review your attempt summary</p>
            </div>
          </div>
          <button
            onClick={() => setShowSubmitModal(false)}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats Table */}
        <div className="my-5 divide-y divide-white/[.06] rounded-2xl border border-white/[.08] bg-white/[.02] text-xs">
          <div className="flex items-center justify-between p-3 text-slate-300">
            <span>Total Questions</span>
            <span className="font-mono font-bold text-white text-sm">{total}</span>
          </div>
          <div className="flex items-center justify-between p-3 text-emerald-300">
            <span>Answered Questions</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{answered}</span>
          </div>
          <div className="flex items-center justify-between p-3 text-purple-300">
            <span>Marked for Review</span>
            <span className="font-mono font-bold text-purple-400 text-sm">{markedReview}</span>
          </div>
          <div className="flex items-center justify-between p-3 text-amber-300">
            <span>Not Answered (Unattempted)</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{unattempted}</span>
          </div>
        </div>

        {unattempted > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-400" />
            <span>
              You still have {unattempted} unanswered question(s). Are you sure you want to finalize and submit?
            </span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => setShowSubmitModal(false)}
            className="rounded-xl border border-white/10 bg-white/[.03] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[.06]"
          >
            Return to Test
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleConfirmSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-glow transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Submitting & Evaluating...</span>
              </>
            ) : (
              <>
                <span>Yes, Submit Exam</span>
                <CheckCircle2 size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
