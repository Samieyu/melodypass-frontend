'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { subscribeColdStart } from '@/lib/api';

export function ColdStartBanner() {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
  const cleanup = subscribeColdStart((slow) => {
    setIsSlow(slow);
  });

  return () => {
    cleanup();
  };
}, []);

  if (!isSlow) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce transition-all duration-300">
      <div className="bg-gradient-to-r from-amber-500/90 via-purple-600/90 to-indigo-600/90 text-white px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md border border-white/20 flex items-center gap-3 text-sm font-medium">
        <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
        <span>Waking up the server, this may take a moment…</span>
        <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
      </div>
    </div>
  );
}
