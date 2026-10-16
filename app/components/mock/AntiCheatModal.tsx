"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import { useExamStore } from "@/app/lib/mock/store";

export default function AntiCheatModal() {
  const {
    showWarningModal,
    warningReason,
    warnings,
    examConfig,
    dismissWarning,
  } = useExamStore();

  if (!showWarningModal) return null;

  const maxStrikes = examConfig?.rules.maxStrikes || 3;
  const isFinalStrike = warnings >= maxStrikes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-red-500/40 bg-[#0d131f] p-6 shadow-2xl shadow-red-500/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 ring-2 ring-red-500/30">
            <ShieldAlert size={26} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Anti-Cheat Warning
            </h3>
            <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Strike {warnings} of {maxStrikes}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-200 leading-relaxed">
          <p className="font-semibold">{warningReason || "Suspicious navigation detected."}</p>
          <p className="mt-1 text-slate-300">
            Switching tabs, exiting fullscreen, or minimizing the exam window is strictly monitored.
          </p>
        </div>

        {isFinalStrike ? (
          <div className="mt-4 rounded-xl bg-red-600/20 border border-red-500/40 p-3 text-xs text-red-200 font-medium">
            You have exceeded the maximum allowed warning strikes ({maxStrikes}). Your exam is being automatically submitted now.
          </div>
        ) : (
          <div className="mt-4 text-xs text-slate-400">
            You have <span className="font-semibold text-white">{maxStrikes - warnings} strike(s) remaining</span> before your exam is forcibly submitted.
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {!isFinalStrike && (
            <button
              onClick={dismissWarning}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-red-500"
            >
              <span>I Understand, Return to Exam</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
