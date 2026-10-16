"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut, Cloud, User, ChevronDown, Sparkles } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

interface UserMenuProps {
  onOpenAuth: () => void;
  completedCount: number;
  totalTopics: number;
  onForceSync?: () => void;
  syncing?: boolean;
}

export default function UserMenu({
  onOpenAuth,
  completedCount,
  totalTopics,
  onForceSync,
  syncing = false,
}: UserMenuProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[.08] hover:text-white"
      >
        <User size={14} className="text-blue-300" />
        <span>Sign In</span>
      </button>
    );
  }

  const initial = (user.displayName || user.email || "U")[0].toUpperCase();
  const displayName = user.displayName || user.email?.split("@")[0] || "Aspirant";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0b1220] p-1.5 pr-3 transition hover:border-white/20 hover:bg-white/[.04]"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className="h-7 w-7 rounded-lg object-cover ring-1 ring-blue-400/40"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-xs font-semibold text-blue-300 ring-1 ring-blue-400/30">
            {initial}
          </div>
        )}
        <div className="text-left hidden sm:block">
          <div className="text-xs font-medium text-white flex items-center gap-1.5">
            <span className="truncate max-w-[100px]">{displayName}</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/[.12] bg-[#0b1220] p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="border-b border-white/[.08] pb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm truncate">{displayName}</span>
              {user.isDemo && (
                <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[9px] uppercase font-bold text-amber-300 ring-1 ring-amber-400/20">
                  Demo
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 truncate mt-0.5">{user.email}</div>
          </div>

          <div className="my-3 space-y-2 rounded-xl bg-white/[.02] p-2.5 border border-white/[.05]">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Syllabus Progress</span>
              <span className="font-semibold text-blue-300">
                {completedCount} / {totalTopics}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-400 transition-all duration-300"
                style={{ width: `${totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
              <Cloud size={12} className="text-emerald-400" />
              <span>{user.isDemo ? "Synced to local cloud storage" : "Supabase cloud auto-sync active"}</span>
            </div>
          </div>

          {onForceSync && (
            <button
              onClick={() => {
                onForceSync();
                setDropdownOpen(false);
              }}
              disabled={syncing}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-300 transition hover:bg-white/[.05] hover:text-white"
            >
              <Cloud size={14} className="text-blue-300" />
              <span>{syncing ? "Syncing..." : "Sync Progress Now"}</span>
            </button>
          )}

          <button
            onClick={() => {
              logout();
              setDropdownOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-red-300 transition hover:bg-red-500/10"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
