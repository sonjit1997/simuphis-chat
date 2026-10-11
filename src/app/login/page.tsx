"use client";

import { signInWithGoogle } from "@/lib/firebase";
import { useAppDispatch } from "@/store/hooks";
import { setCurrentUser } from "@/store/slices/authSlice";
import { User } from "@/types/chat";
import { Mail, ShieldCheck, Sparkles, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email login form state
  const [emailName, setEmailName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

  const saveUserSession = async (user: User) => {
    // Set 7-day session cookie for Next.js middleware protection
    document.cookie = `simuphish_session=${user.id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

    // Persist user to directory
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
    } catch {}

    // Broadcast across tabs
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel("simuphish_tab_sync");
      bc.postMessage({ type: "user:registered", data: user });
      bc.close();
    }

    dispatch(setCurrentUser(user));
    router.push("/");
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      await saveUserSession(user);
    } catch (err: any) {
      console.error(err);
      setError("Google Sign-In failed or was cancelled. Please try again or sign in with email below.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    const cleanEmail = emailAddress.trim().toLowerCase();
    const cleanName = emailName.trim() || cleanEmail.split("@")[0];
    const userId = "usr_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");

    const emailUser: User = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
      status: "online",
    };

    try {
      await saveUserSession(emailUser);
    } catch (err: any) {
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#070b13] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f172a]/95 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-md">
        {/* App Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-600/30 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome to SimuPhish
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Production Real-Time Chat with WebSockets, Cloudinary, and Redux
          </p>
        </div>

        {/* Primary Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        {error && (
          <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl my-4 text-center">
            {error}
          </p>
        )}

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-800" />
          <span className="px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            Or sign in with email
          </span>
          <div className="flex-1 border-t border-slate-800" />
        </div>

        {/* Real Email Sign-In Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={emailName}
                onChange={(e) => setEmailName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="e.g. alex@company.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !emailAddress.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/20 mt-2"
          >
            {loading ? "Signing in..." : "Continue with Email"}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Sign in from 2 windows to start real-time messaging!
        </div>
      </div>
    </div>
  );
}
