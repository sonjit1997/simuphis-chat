"use client";

import { signInWithGoogle } from "@/lib/firebase";
import { CONTACT_USERS, CURRENT_USER } from "@/mock/initialData";
import { useAppDispatch } from "@/store/hooks";
import { setCurrentUser } from "@/store/slices/authSlice";
import { User } from "@/types/chat";
import { ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveUserSession = (user: User) => {
    // Set 7-day session cookie for Next.js middleware protection
    document.cookie = `simuphish_session=${user.id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    dispatch(setCurrentUser(user));
    router.push("/conv-1");
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      saveUserSession(user);
    } catch (err: any) {
      console.error(err);
      setError("Google Sign-In was cancelled or failed. You can also select a test persona below.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPersona = (user: User) => {
    saveUserSession(user);
  };

  const availablePersonas = [CURRENT_USER, ...CONTACT_USERS.slice(0, 2)];

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

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-60 mb-6 cursor-pointer"
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
          <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl mb-4 text-center">
            {error}
          </p>
        )}

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-800" />
          <span className="px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            Or select test persona
          </span>
          <div className="flex-1 border-t border-slate-800" />
        </div>

        {/* Quick Persona Selector for Multi-Tab & Evaluator Testing */}
        <div className="space-y-2">
          {availablePersonas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => handleSelectPersona(persona)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700/60">
                  <Image
                    src={persona.avatarUrl}
                    alt={persona.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {persona.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">{persona.email}</p>
                </div>
              </div>
              <UserCheck className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </button>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Open in 2 tabs to test bi-directional real-time messaging!
        </div>
      </div>
    </div>
  );
}
