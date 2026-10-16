"use client";

import React, { useState } from "react";
import { X, Delete } from "lucide-react";
import { useExamStore } from "@/app/lib/mock/store";

export default function CalculatorModal() {
  const { showCalculator, setShowCalculator } = useExamStore();
  const [display, setDisplay] = useState("0");

  if (!showCalculator) return null;

  const handleDigit = (digit: string) => {
    setDisplay((prev) => (prev === "0" ? digit : prev + digit));
  };

  const handleOp = (op: string) => {
    setDisplay((prev) => prev + " " + op + " ");
  };

  const handleClear = () => {
    setDisplay("0");
  };

  const handleBack = () => {
    setDisplay((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
  };

  const handleEqual = () => {
    try {
      // Safe arithmetic evaluator for basic math expressions
      const sanitized = display.replace(/×/g, "*").replace(/÷/g, "/");
      if (!/^[\d\s+\-*/.()]+$/.test(sanitized)) {
        setDisplay("Error");
        return;
      }
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${sanitized})`)();
      setDisplay(String(Number(result.toFixed(6))));
    } catch {
      setDisplay("Error");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 w-72 rounded-3xl border border-white/[.15] bg-[#0c1322] p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/[.08] pb-2 mb-3">
        <span className="text-xs font-semibold text-white">CBT Scientific Calculator</span>
        <button
          onClick={() => setShowCalculator(false)}
          className="text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Screen */}
      <div className="rounded-xl bg-black/50 border border-white/10 p-3 text-right font-mono text-lg text-emerald-300 overflow-x-auto">
        {display}
      </div>

      {/* Buttons */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-xs font-bold text-white">
        <button onClick={handleClear} className="rounded-lg bg-red-500/20 text-red-300 p-2.5 hover:bg-red-500/30">C</button>
        <button onClick={handleBack} className="rounded-lg bg-white/10 p-2.5 hover:bg-white/20"><Delete size={14} className="mx-auto" /></button>
        <button onClick={() => handleOp("%")} className="rounded-lg bg-white/10 p-2.5 hover:bg-white/20">%</button>
        <button onClick={() => handleOp("÷")} className="rounded-lg bg-blue-500/30 text-blue-300 p-2.5 hover:bg-blue-500/40">÷</button>

        <button onClick={() => handleDigit("7")} className="rounded-lg bg-white/5 p-2.5 hover:bg-white/10">7</button>
        <button onClick={() => handleDigit("8")} className="rounded-lg bg-white/5 p-2.5 hover:bg-white/10">8</button>
        <button onClick={() => handleDigit("9")} className="rounded-lg bg-white/5 p-2.5 hover:bg-white/10">9</button>
        <button onClick={() => handleOp("×")} className="rounded-lg bg-blue-500/30 text-blue-300 p-2.5 hover:bg-blue-500/40">×</button>

        <button onClick={() => handleDigit("4")} className="rounded-lg bg-white/5 p-2.5 hover:bg-white/10">4</button>
        <button onClick={() => handleDigit("5")} className="rounded-lg bg-white/5 p-2.5 hover:bg-white/10">5</button>
        <button onClick={() => handleDigit("6")} className="rounded-lg bg-white/5 p-2.5 hover:bg-white/10">6</button>
        <button onClick={() => handleOp("-")} className="rounded-lg bg-blue-500/30 text-blue-300 p-2.5 hover:bg-blue-500/40">−</button>

        <button onClick={() => handleDigit("1")} className="rounded-lg bg-white/5 p-2.5 hover:bg-white/10">1</button>
        <button onClick={() => handleDigit("2")} className="rounded-lg bg-white/5 p-2.5 hover:bg-white/10">2</button>
        <button onClick={() => handleDigit("3")} className="rounded-lg bg-white/5 p-2.5 hover:bg-white/10">3</button>
        <button onClick={() => handleOp("+")} className="rounded-lg bg-blue-500/30 text-blue-300 p-2.5 hover:bg-blue-500/40">+</button>

        <button onClick={() => handleDigit("0")} className="col-span-2 rounded-lg bg-white/5 p-2.5 hover:bg-white/10">0</button>
        <button onClick={() => handleDigit(".")} className="rounded-lg bg-white/5 p-2.5 hover:bg-white/10">.</button>
        <button onClick={handleEqual} className="rounded-lg bg-emerald-600 text-white p-2.5 hover:bg-emerald-500">=</button>
      </div>
    </div>
  );
}
