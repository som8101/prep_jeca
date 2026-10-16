"use client";

import React, { useState } from "react";
import { useExamStore, PaletteStatus } from "@/app/lib/mock/store";

export default function QuestionPalette() {
  const {
    questions,
    currentQuestionIndex,
    navigateToQuestion,
    getPaletteStatus,
    examConfig,
    activeSectionId,
    switchSection,
  } = useExamStore();

  const [filter, setFilter] = useState<"ALL" | PaletteStatus>("ALL");

  // Aggregate counts
  let answeredCount = 0;
  let notAnsweredCount = 0;
  let markedReviewCount = 0;
  let answeredMarkedCount = 0;
  let notVisitedCount = 0;

  questions.forEach((q) => {
    const status = getPaletteStatus(q.id);
    if (status === "answered") answeredCount++;
    else if (status === "not-answered") notAnsweredCount++;
    else if (status === "marked-review") markedReviewCount++;
    else if (status === "answered-marked") answeredMarkedCount++;
    else if (status === "not-visited") notVisitedCount++;
  });

  const getStatusClasses = (status: PaletteStatus, isCurrent: boolean) => {
    let base = "relative flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition ";

    if (isCurrent) {
      base += "ring-2 ring-white ring-offset-2 ring-offset-[#0b1220] scale-105 z-10 ";
    }

    switch (status) {
      case "answered":
        return base + "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20";
      case "not-answered":
        return base + "bg-red-500/80 text-white";
      case "marked-review":
        return base + "bg-purple-600 text-white";
      case "answered-marked":
        return base + "bg-purple-600 text-white after:content-[''] after:absolute after:bottom-1 after:right-1 after:h-2 after:w-2 after:rounded-full after:bg-emerald-400";
      case "not-visited":
      default:
        return base + "bg-white/[.06] text-slate-400 border border-white/[.08] hover:bg-white/[.1]";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b1220] rounded-2xl border border-white/[.1] p-4">
      <div className="border-b border-white/[.08] pb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Question Palette
        </h3>
        <div className="mt-1 text-sm font-semibold text-white">
          {examConfig?.sections.find((s) => s.id === activeSectionId)?.name || "All Questions"}
        </div>
      </div>

      {/* Legend & Stats Grid */}
      <div className="my-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-1.5 px-2 text-emerald-300 border border-emerald-500/20">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span>{answeredCount} Answered</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-1.5 px-2 text-red-300 border border-red-500/20">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span>{notAnsweredCount} Not Answered</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 p-1.5 px-2 text-purple-300 border border-purple-500/20">
          <span className="h-3 w-3 rounded-full bg-purple-600" />
          <span>{markedReviewCount} Marked Review</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/[.03] p-1.5 px-2 text-slate-400 border border-white/[.06]">
          <span className="h-3 w-3 rounded-full bg-white/20" />
          <span>{notVisitedCount} Not Visited</span>
        </div>
      </div>

      {/* Question Number Tiles */}
      <div className="flex-1 overflow-y-auto pr-1 py-2">
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
          {questions.map((q, idx) => {
            const status = getPaletteStatus(q.id);
            const isCurrent = idx === currentQuestionIndex;

            if (filter !== "ALL" && status !== filter) return null;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => navigateToQuestion(idx)}
                className={getStatusClasses(status, isCurrent)}
                title={`Question ${idx + 1} (${status})`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
