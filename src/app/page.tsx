'use client';

import React from 'react';
import Link from 'next/link';
import { Disc3, KeyRound, QrCode, Music2, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

export default function HomePage() {
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

        {/* Hero Graphic - Vinyl Album */}
        <div className="relative w-72 h-72 mb-8 group">
          {/* Vinyl Disc Behind */}
          <div className="absolute inset-0 bg-neutral-900 rounded-full border-4 border-neutral-800 shadow-2xl flex items-center justify-center animate-spin-slow group-hover:scale-105 transition-transform duration-500 overflow-hidden">
            {/* CD image background */}
            <img
              src="/cd-art.jpg"
              alt="CD Album Art"
              className="absolute inset-0 w-full h-full object-cover opacity-90 rounded-full"
            />
            {/* Center spindle hole */}
            <div className="relative z-10 w-16 h-16 rounded-full border-4 border-neutral-900/90 bg-neutral-950 flex items-center justify-center backdrop-blur-sm shadow-inner">
              <div className="w-5 h-5 rounded-full bg-neutral-900 border border-white/20" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-white/20 pointer-events-none" />
          </div>

          {/* Album Cover Sleeve */}
          <div className="absolute inset-y-0 left-0 w-52 rounded-2xl glass-card overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between p-4 group-hover:-translate-x-6 transition-transform duration-500 relative">
            <img
              src="/album-cover.jpg"
              alt="Album Cover - Abener Tagesse"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />
            
            <div className="relative z-10 flex justify-between items-start">
              <Disc3 className="w-6 h-6 text-brand-400" />
              <span className="text-[10px] font-mono tracking-widest text-gray-200 uppercase bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                OFFICIAL PASS
              </span>
            </div>
            
            <div className="relative z-10 text-left">
              <p className="text-[11px] uppercase font-bold text-accent-cyan tracking-wider drop-shadow">NEW GOSPEL VIDEO</p>
              <h2 className="text-xl font-extrabold text-white leading-tight drop-shadow-md">ንካኝ ዛሬ</h2>
              <p className="text-xs text-gray-200 drop-shadow font-medium">by Abener Tagesse</p>
            </div>
          </div>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          QR Song <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-accent-violet to-accent-cyan">Access</span>
        </h1>
        <p className="text-sm text-gray-400 max-w-xs mb-8">
          Enter your 6-character pass code to unlock full album playback permanently on this device.
        </p>

        {/* CTA Buttons */}
        <div className="w-full space-y-3 mb-8">
          <Link
            href="/access"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-accent-violet to-brand-500 hover:opacity-95 text-white font-bold text-base shadow-lg shadow-brand-500/25 flex items-center justify-center gap-3 group transition-all duration-200 active:scale-[0.98]"
          >
            <KeyRound className="w-5 h-5 text-accent-cyan group-hover:rotate-12 transition-transform" />
            <span>Enter Access Code</span>
            <ChevronRight className="w-5 h-5 ml-auto text-white/70 group-hover:translate-x-1 transition-transform" />
          </Link>
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
