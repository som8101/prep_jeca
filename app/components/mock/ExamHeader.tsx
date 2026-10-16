"use client";

import React from "react";
import { Clock, ShieldAlert, CheckCircle2, Calculator, Maximize2, Send, Cloud } from "lucide-react";
import { useExamStore } from "@/app/lib/mock/store";
import { requestExamFullscreen } from "@/app/lib/mock/antiCheat";

export default function ExamHeader() {
  const {
    examConfig,
    remainingSeconds,
    warnings,
    syncStatus,
    setShowCalculator,
    showCalculator,
    setShowSubmitModal,
    activeSectionId,
    switchSection,
    questions,
    answers,
  } = useExamStore();

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isLowTime = remainingSeconds <= 300; // < 5 mins
  const isCriticalTime = remainingSeconds <= 60; // < 1 min

  // Count answered
  const answeredCount = Object.values(answers).filter(
    (a) => a.selected && a.selected.length > 0
  ).length;

  return (
    <header className="sticky top-0 z-30 border-b border-white/[.1] bg-[#070b14]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Exam title & mode pill */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/30">
            <span className="font-mono text-sm font-bold">CBT</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white truncate max-w-[200px] sm:max-w-md">
              {examConfig?.title || "JECA Mock Test"}
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="text-blue-300">{answeredCount}/{questions.length} Answered</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Cloud size={10} className={syncStatus === "SAVED" ? "text-emerald-400" : "text-amber-400"} />
                {syncStatus === "SAVING" ? "Syncing..." : syncStatus === "SAVED" ? "Autosaved" : "Local Sync"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Section switcher */}
        <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.03] p-1">
          {examConfig?.sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => switchSection(sec.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeSectionId === sec.id
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {sec.name}
            </button>
          ))}
        </div>

        {/* Right: Timer, Calculator, Fullscreen & Submit */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Strikes warning counter if any */}
          {warnings > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-300">
              <ShieldAlert size={14} />
              <span>Strike {warnings}/{examConfig?.rules.maxStrikes || 3}</span>
            </div>
          )}

          {/* Calculator toggle */}
          {examConfig?.rules.allowCalculator && (
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className={`rounded-lg border p-2 text-slate-300 transition ${
                showCalculator
                  ? "border-blue-400 bg-blue-500/20 text-white"
                  : "border-white/10 bg-white/[.03] hover:text-white"
              }`}
              title="Calculator"
            >
              <Calculator size={16} />
            </button>
          )}

          {/* Fullscreen button */}
          <button
            onClick={() => requestExamFullscreen()}
            className="hidden sm:inline-flex rounded-lg border border-white/10 bg-white/[.03] p-2 text-slate-300 transition hover:text-white"
            title="Toggle Fullscreen"
          >
            <Maximize2 size={16} />
          </button>

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-sm font-semibold transition ${
              isCriticalTime
                ? "animate-pulse border-red-500 bg-red-500/20 text-red-300"
                : isLowTime
                ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                : "border-blue-400/30 bg-blue-500/10 text-blue-200"
            }`}
          >
            <Clock size={16} className={isCriticalTime ? "text-red-400" : isLowTime ? "text-amber-400" : "text-blue-300"} />
            <span>{formattedTime}</span>
          </div>

          {/* Submit button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-glow transition hover:bg-emerald-500"
          >
            <span>Submit</span>
            <Send size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
