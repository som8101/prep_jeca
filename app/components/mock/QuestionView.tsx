"use client";

import React, { useEffect } from "react";
import { Bookmark, ChevronLeft, ChevronRight, RotateCcw, ArrowRight, Tag, Info } from "lucide-react";
import { useExamStore } from "@/app/lib/mock/store";

export default function QuestionView() {
  const {
    questions,
    currentQuestionIndex,
    answers,
    selectOption,
    clearResponse,
    toggleMarkForReview,
    navigateToNext,
    navigateToPrev,
  } = useExamStore();

  const currentQ = questions[currentQuestionIndex];
  if (!currentQ) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        Loading question...
      </div>
    );
  }

  const currentAns = answers[currentQ.id] || { selected: [], markedForReview: false, timeSpentSeconds: 0 };
  const isMulti = currentQ.type === "MCQ_MULTI";
  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  // Keyboard shortcut listener (1-4 or A-D for options, N for Next, P for Prev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();
      if (["1", "2", "3", "4"].includes(key)) {
        const idx = parseInt(key) - 1;
        if (currentQ.options && idx < currentQ.options.length) {
          selectOption(currentQ.id, idx, isMulti);
        }
      } else if (["A", "B", "C", "D"].includes(key)) {
        const idx = key.charCodeAt(0) - 65;
        if (currentQ.options && idx < currentQ.options.length) {
          selectOption(currentQ.id, idx, isMulti);
        }
      } else if (key === "ARROWLEFT") {
        navigateToPrev();
      } else if (key === "ARROWRIGHT") {
        navigateToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQ, isMulti, selectOption, navigateToNext, navigateToPrev]);

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Top Question Info Bar */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.08] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-blue-500/20 px-2.5 py-1 font-mono text-xs font-bold text-blue-300 ring-1 ring-blue-400/30">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="rounded-lg bg-white/[.05] px-2.5 py-1 text-xs font-medium text-slate-300 border border-white/[.08]">
              {currentQ.subject}
            </span>
            <span className="rounded-lg bg-white/[.03] px-2 py-1 text-[11px] text-slate-400">
              {currentQ.topic}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isMulti ? (
              <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300 ring-1 ring-purple-400/30">
                Category-II (+2 Marks • Partial Credit • No Negative)
              </span>
            ) : (
              <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-300 ring-1 ring-blue-400/20">
                Category-I (+1 Mark • -0.25 Negative)
              </span>
            )}
          </div>
        </div>

        {/* Question Content */}
        <div className="py-6">
          <div className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
            {currentQ.question}
          </div>

          {currentQ.image && (
            <div className="mt-4 rounded-xl border border-white/10 overflow-hidden bg-black/40 max-w-lg">
              <img src={currentQ.image} alt="Question Diagram" className="w-full object-contain" />
            </div>
          )}

          {isMulti && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-400/20">
              <Info size={14} />
              <span>One or more options may be correct. Select all that apply.</span>
            </div>
          )}
        </div>

        {/* Options Selection */}
        {currentQ.options && currentQ.options.length > 0 && (
          <div className="space-y-3 pb-8">
            {currentQ.options.map((opt, idx) => {
              const isSelected = currentAns.selected.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectOption(currentQ.id, idx, isMulti)}
                  className={`w-full flex items-start gap-3.5 rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/15 shadow-lg shadow-blue-500/10"
                      : "border-white/[.08] bg-[#0c1322] hover:border-white/20 hover:bg-[#10192d]"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-${
                      isMulti ? "md" : "full"
                    } text-xs font-bold transition ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "border border-white/20 bg-white/[.03] text-slate-300"
                    }`}
                  >
                    {isSelected && !isMulti ? "●" : isSelected && isMulti ? "✔" : optionLetters[idx]}
                  </div>
                  <div className="text-sm sm:text-base text-slate-200 leading-relaxed">
                    {opt}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="border-t border-white/[.08] pt-4 mt-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleMarkForReview(currentQ.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                currentAns.markedForReview
                  ? "border-purple-400 bg-purple-500/20 text-purple-200"
                  : "border-white/10 bg-white/[.03] text-slate-300 hover:bg-white/[.06] hover:text-white"
              }`}
            >
              <Bookmark size={14} className={currentAns.markedForReview ? "fill-purple-400" : ""} />
              <span>{currentAns.markedForReview ? "Marked for Review" : "Mark for Review"}</span>
            </button>

            {currentAns.selected.length > 0 && (
              <button
                onClick={() => clearResponse(currentQ.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <RotateCcw size={13} />
                <span>Clear Response</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={navigateToPrev}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[.03] px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[.06] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              onClick={navigateToNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-glow transition hover:bg-blue-400"
            >
              <span>Save & Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
