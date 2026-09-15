'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Lock, ShieldAlert, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { AudioPlayer, AlbumDetails } from '@/components/AudioPlayer';

export default function AlbumPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbum = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<AlbumDetails>(`/albums/${id}`);
      setAlbum(data);
    } catch (err: any) {
      console.error('Fetch album error:', err);
      if (err.status === 401 || err.status === 403) {
        setError(err.message || 'Access denied. Your device session is invalid or bound to another album.');
      } else {
        setError(err.message || 'Failed to load album. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAlbum();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Verifying session & loading music video...</p>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 text-center border-2 border-red-500/30 shadow-xl dark:shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 dark:bg-red-500/15 border-2 border-red-500/30 dark:border-red-500/40 flex items-center justify-center text-red-600 dark:text-red-300 mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Album Access Restricted</h1>
          <p className="text-sm text-slate-700 dark:text-slate-200 mb-6 font-medium leading-relaxed">{error}</p>

          <div className="space-y-3">
            <Link
              href="/access"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-extrabold text-sm block shadow-xl shadow-indigo-600/30 hover:from-blue-500 hover:to-violet-500 transition-all border border-white/20"
            >
              Enter Access Code
            </Link>
            <button
              onClick={fetchAlbum}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Retry Session</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 pb-24">
      <div className="max-w-xl mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Home</span>
        </Link>
      </div>

      <AudioPlayer album={album} />
    </div>
  );
}
