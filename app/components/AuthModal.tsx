"use client";

import React, { useState } from "react";
import {
  X, Sparkles, Mail, Lock, User as UserIcon, AlertCircle,
  ArrowRight, CheckCircle2, Eye, EyeOff, Database,
  Loader2
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customSubtitle?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  customSubtitle,
}: AuthModalProps) {
  const {
    isConfigured,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    loginDemoUser,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        if (!name.trim()) {
          throw new Error("Please enter your full name.");
        }
        await signUpWithEmail(email, password, name.trim());
        setSuccessMsg("Account created! You are now logged in.");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (err.message.includes("User already registered")) {
          setError("An account with this email already exists. Try signing in.");
        } else if (err.message.includes("Password should be at least")) {
          setError("Password must be at least 6 characters long.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to initialize Google authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    loginDemoUser();
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-white/[.08]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
              <Sparkles size={19} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-white">
                {mode === "signin" ? "Sign In to JECA PrepHub" : "Create Aspirant Account"}
              </h2>
              <p className="text-xs text-slate-400">
                {customSubtitle || "Powered by Supabase cloud storage"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/[.06] hover:text-white"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Supabase Status / Notice */}
        {!isConfigured && (
          <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/[.06] p-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Database size={16} className="text-emerald-300 mt-0.5 shrink-0" />
              <div className="text-slate-300 leading-relaxed">
                <span className="font-semibold text-emerald-200">Supabase Connected:</span> Ready for your credentials in <code className="text-emerald-300 font-mono">.env.local</code>. You can also test with Instant Demo Login!
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="mt-4 grid grid-cols-2 rounded-xl bg-white/[.04] p-1 border border-white/[.06]">
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(null); setSuccessMsg(null); }}
            className={`rounded-lg py-2 text-xs font-medium transition ${
              mode === "signin"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(null); setSuccessMsg(null); }}
            className={`rounded-lg py-2 text-xs font-medium transition ${
              mode === "signup"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || !isConfigured}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[.03] py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[.07] disabled:opacity-40"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <span className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/[.08]" />
          </span>
          <span className="relative bg-[#0c1322] px-3 uppercase tracking-wider text-[10px] text-slate-500 font-medium">
            Or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Your Full Name</label>
              <div className="auth-input-group">
                <UserIcon size={16} className="auth-input-icon" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Somnath Gorai"
                  className="auth-input"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Email Address</label>
            <div className="auth-input-group">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="auth-input"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Password</label>
            <div className="auth-input-group">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-400 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Please wait...
              </span>
            ) : mode === "signin" ? (
              "Sign In"
            ) : (
              "Create Free Account"
            )}
          </button>
        </form>

        {/* Demo Mode Button */}
        <div className="mt-4 pt-3.5 border-t border-white/[.07] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="inline-flex items-center gap-1.5 text-blue-300 hover:text-blue-200 transition"
          >
            <span>⚡ Instant Demo Login</span>
            <ArrowRight size={13} />
          </button>

          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-400" /> Auto-syncs checklist
          </span>
        </div>
      </div>
    </div>
  );
}
