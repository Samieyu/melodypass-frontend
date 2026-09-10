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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-accent-violet/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto z-10 flex flex-col items-center text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-xs font-semibold text-brand-400 mb-6 border border-brand-500/30">
          <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Physical Pass to Digital Album</span>
        </div>

        {/* Mobile-First Physical CD & Album Sleeve Presentation */}
        <div className="relative w-[280px] sm:w-[320px] h-[190px] sm:h-[210px] my-6 select-none">
          {/* Spinning CD Disc - Sits on the right, partially peeking out */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 sm:w-44 sm:h-44 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-2 border-neutral-700/80 z-10 animate-spin-slow overflow-hidden flex items-center justify-center">
            {/* CD Disc Face Image */}
            <img
              src="/cd-art.jpg"
              alt="CD Album Disc"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Vinyl grooves & sheen overlay */}
            <div className="absolute inset-0 rounded-full border-[6px] border-black/40 pointer-events-none" />
            <div className="absolute inset-0 rounded-full border-[12px] border-white/5 pointer-events-none" />
            {/* Center Spindle Hole */}
            <div className="relative z-20 w-12 h-12 rounded-full bg-neutral-950 border-4 border-neutral-800 shadow-inner flex items-center justify-center backdrop-blur-md">
              <div className="w-4 h-4 rounded-full bg-[#0a0a0f] border border-white/20" />
            </div>
          </div>

          {/* Album Cover Sleeve - Sits on the left with prominent shadow */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-40 h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.9)] border border-white/20 z-20 transition-transform active:scale-95 duration-200">
            <img
              src="/album-cover.jpg"
              alt="Album Cover - Abener Tagesse"
              className="w-full h-full object-cover"
            />
            {/* Realistic light sheen on sleeve edge */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
            {/* Small badge */}
            <div className="absolute bottom-2 left-2 right-2">
              <span className="inline-block text-[9px] font-mono tracking-widest text-white uppercase bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/15">
                OFFICIAL PASS
              </span>
            </div>
          </div>
        </div>

        {/* Song & Artist Title */}
        <div className="mb-3">
          <p className="text-[11px] uppercase font-bold text-accent-cyan tracking-widest">NEW GOSPEL MUSIC VIDEO</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-accent-violet to-accent-cyan">ንካኝ ዛሬ</span>
          </h1>
          <p className="text-sm font-semibold text-gray-300 mt-0.5">Singer Abener Tagesse</p>
        </div>
        <p className="text-xs text-gray-400 max-w-xs mb-6">
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
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-brand-600 to-accent-violet hover:opacity-95 text-white font-extrabold text-base shadow-xl shadow-brand-500/30 flex items-center justify-center gap-3 group transition-all duration-200 active:scale-[0.98] border border-white/20"
              >
                <Sparkles className="w-5 h-5 text-accent-cyan animate-pulse" />
                <span>Continue Watching ንካኝ ዛሬ</span>
                <ChevronRight className="w-5 h-5 ml-auto text-white/70 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/access"
                className="inline-block text-xs text-gray-400 hover:text-white transition-colors underline underline-offset-4 pt-1"
              >
                Enter a different code
              </Link>
            </>
          ) : (
            <Link
              href="/access"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-accent-violet to-brand-500 hover:opacity-95 text-white font-bold text-base shadow-lg shadow-brand-500/25 flex items-center justify-center gap-3 group transition-all duration-200 active:scale-[0.98]"
            >
              <KeyRound className="w-5 h-5 text-accent-cyan group-hover:rotate-12 transition-transform" />
              <span>Enter Access Code</span>
              <ChevronRight className="w-5 h-5 ml-auto text-white/70 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-2 gap-3 w-full text-left">
          <div className="p-3.5 rounded-xl glass-card border border-white/5 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-accent-cyan shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-semibold text-gray-200">1-Device Binding</h3>
              <p className="text-[11px] text-gray-400">Locked securely to your device</p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl glass-card border border-white/5 flex items-start gap-2.5">
            <Music2 className="w-5 h-5 text-accent-violet shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-semibold text-gray-200">HD Streaming</h3>
              <p className="text-[11px] text-gray-400">Cloudflare R2 fast audio</p>
            </div>
          </div>
        </div>

        {/* Admin Link */}
        <div className="mt-8">
          <Link
            href="/admin/login"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4"
          >
            Artist / Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
