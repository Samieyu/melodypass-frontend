'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Disc3, KeyRound, QrCode, Music2, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [savedSession, setSavedSession] = useState<{ albumId: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('melodypass_session_token');
    const albumId = localStorage.getItem('melodypass_album_id');
    if (token && albumId) {
      setSavedSession({ albumId });
    }
  }, []);
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto z-10 flex flex-col items-center text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-6 border border-indigo-300/80 dark:border-indigo-400/35 shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
          <span>Physical Pass to Digital Access</span>
        </div>

        {/* Mobile-First Physical CD & Album Sleeve Presentation (50% in, 50% out) */}
        <div className="relative w-[270px] sm:w-[290px] h-[180px] sm:h-[190px] my-6 select-none mx-auto">
          {/* Rotating CD Disc - Exactly 50% inside the rectangle (behind it), 50% outside */}
          <div className="absolute left-[90px] sm:left-[95px] top-0 w-[180px] h-[180px] sm:w-[190px] sm:h-[190px] rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.45)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.85)] border-2 border-slate-400 dark:border-slate-600 z-10 animate-spin-slow overflow-hidden flex items-center justify-center">
            {/* CD Disc Face Image */}
            <img
              src="/cd-art.jpg"
              alt="CD Album Disc"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Realistic vinyl groove rings & light sheen */}
            <div className="absolute inset-0 rounded-full border-[8px] border-black/40 pointer-events-none" />
            <div className="absolute inset-0 rounded-full border-[18px] border-white/10 pointer-events-none" />
            <div className="absolute inset-0 rounded-full border border-white/25 pointer-events-none" />
            
            {/* Center Spindle Ring and Transparent Hole */}
            <div className="relative z-20 w-14 h-14 rounded-full bg-slate-950 border-4 border-slate-700 shadow-inner flex items-center justify-center backdrop-blur-md">
              <div className="w-5 h-5 rounded-full bg-[#0b0f19] border-2 border-white/40 shadow-inner" />
            </div>
          </div>

          {/* Album Cover Rectangle Sleeve - Anchored on the left */}
          <div className="absolute left-0 top-0 w-[180px] h-[180px] sm:w-[190px] sm:h-[190px] rounded-2xl overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.3)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.95)] border border-slate-200 dark:border-white/25 z-20 transition-transform duration-200">
            <img
              src="/album-cover.jpg"
              alt="Album Cover - Abener Tagesse"
              className="w-full h-full object-cover"
            />
            {/* Light reflection gradient on sleeve edge */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/15 pointer-events-none" />
            {/* Official Pass Badge */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5">
              <span className="inline-block text-[10px] font-mono font-bold tracking-widest text-white uppercase bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 shadow-md">
                OFFICIAL PASS
              </span>
            </div>
          </div>
        </div>

        {/* Song & Artist Title */}
        <div className="mb-3">
          <p className="text-xs uppercase font-bold text-indigo-600 dark:text-cyan-400 tracking-widest drop-shadow-sm">NEW GOSPEL MUSIC VIDEO</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-800 dark:from-white dark:via-indigo-200 dark:to-cyan-300">ንካኝ ዛሬ</span>
          </h1>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-1">Singer Abener Tagesse</p>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs mb-6 leading-relaxed font-medium">
          {savedSession
            ? 'Your device is authenticated! Click below to resume your video immediately.'
            : 'Enter your 6-character pass code to unlock the full official video permanently on this device.'}
        </p>

        {/* CTA Buttons - Smart Caching System */}
        <div className="w-full space-y-3 mb-8">
          {savedSession ? (
            <>
              <Link
                href={`/album/${savedSession.albumId}`}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 group transition-all duration-200 active:scale-[0.98] border border-white/25"
              >
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span>Continue Watching ንካኝ ዛሬ</span>
                <ChevronRight className="w-5 h-5 ml-auto text-white group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/access"
                className="inline-block text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors underline underline-offset-4 pt-1"
              >
                Enter a different code
              </Link>
            </>
          ) : (
            <Link
              href="/access"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/35 flex items-center justify-center gap-3 group transition-all duration-200 active:scale-[0.98] border border-white/25"
            >
              <KeyRound className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform" />
              <span>Enter Access Code</span>
              <ChevronRight className="w-5 h-5 ml-auto text-white group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-2 gap-3 w-full text-left">
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-white/15 flex items-start gap-3 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">1-Device Binding</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">Locked securely to this phone</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-white/15 flex items-start gap-3 shadow-sm">
            <Music2 className="w-5 h-5 text-indigo-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Fast Streaming</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">Cloudflare R2 HD playback</p>
            </div>
          </div>
        </div>

        {/* Admin Link */}
        <div className="mt-8">
          <Link
            href="/admin/login"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors underline underline-offset-4"
          >
            Artist / Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
