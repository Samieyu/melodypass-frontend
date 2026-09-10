'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { AccessCodeForm } from '@/components/AccessCodeForm';

export default function AccessPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto z-10">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Card Container */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">Activate Song Pass</h1>
              <p className="text-xs text-gray-400">Claim permanent access on this device</p>
            </div>
          </div>

          <Suspense fallback={
            <div className="py-12 flex justify-center text-brand-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          }>
            <AccessCodeForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Each access code can only be bound once to a single device.
        </p>
      </div>
    </div>
  );
}
