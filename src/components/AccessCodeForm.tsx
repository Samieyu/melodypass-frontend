'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Phone, KeyRound, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export function AccessCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCodeFromUrl = searchParams.get('code') || '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cachedAlbumId, setCachedAlbumId] = useState<string | null>(null);

  // Check cached session on mount and prefill
  useEffect(() => {
    const savedToken = localStorage.getItem('melodypass_session_token');
    const savedAlbumId = localStorage.getItem('melodypass_album_id');
    const savedName = localStorage.getItem('melodypass_user_name');
    const savedPhone = localStorage.getItem('melodypass_user_phone');

    if (savedName) setName(savedName);
    if (savedPhone) setPhone(savedPhone);
    if (savedToken && savedAlbumId) {
      setCachedAlbumId(savedAlbumId);
    }

    if (initialCodeFromUrl && initialCodeFromUrl.length === 6) {
      const chars = initialCodeFromUrl.toUpperCase().split('');
      setCodeDigits(chars);
    }
  }, [initialCodeFromUrl]);

  const handleDigitChange = (index: number, value: string) => {
    const uppercaseVal = value.toUpperCase();

    // Filter out ambiguous characters: 0, O, 1, I, L
    const sanitized = uppercaseVal.replace(/[01IOL]/g, '');
    if (!sanitized && value.length > 0) return;

    const char = sanitized.slice(-1);
    const newDigits = [...codeDigits];
    newDigits[index] = char;
    setCodeDigits(newDigits);
    setError(null);

    // Auto focus next box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^2-9A-HJ-NP-Z]/g, '');
    if (pasted.length > 0) {
      const chars = pasted.slice(0, 6).split('');
      const newDigits = [...codeDigits];
      chars.forEach((c, idx) => {
        newDigits[idx] = c;
      });
      setCodeDigits(newDigits);
      const nextIndex = Math.min(chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const fullCode = codeDigits.join('').toUpperCase();

    // Client-side validation
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (fullCode.length !== 6) {
      setError('Please enter all 6 characters of your access code.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch('/access/verify', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          code: fullCode,
        }),
      });

      if (res.sessionToken) {
        localStorage.setItem('melodypass_session_token', res.sessionToken);
      }
      if (res.albumId) {
        localStorage.setItem('melodypass_album_id', res.albumId);
      }
      localStorage.setItem('melodypass_user_name', name.trim());
      localStorage.setItem('melodypass_user_phone', phone.trim());

      setSuccessMsg(res.message || 'Access granted! Redirecting to video...');
      
      setTimeout(() => {
        router.push(`/album/${res.albumId}`);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Failed to verify code. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Cached Session Quick Resume Card */}
      {cachedAlbumId && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 dark:from-emerald-500/20 dark:via-indigo-500/20 dark:to-purple-500/20 border-2 border-emerald-500/30 dark:border-emerald-500/40 text-slate-800 dark:text-white space-y-3 shadow-md dark:shadow-xl">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>Device Already Verified!</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-200 leading-relaxed font-medium">
            You already unlocked <strong className="text-slate-900 dark:text-white">ንካኝ ዛሬ</strong> on this device. You can jump directly to the video without entering your code again.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/album/${cachedAlbumId}`)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all border border-emerald-400/30"
          >
            <span>▶ Resume Watching Video</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="text-center pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Or enter a different code below</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 dark:bg-red-500/15 border-2 border-red-500/30 dark:border-red-500/40 text-red-700 dark:text-red-200 text-sm flex items-start gap-3 animate-shake shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900 dark:text-white">Access Denied</p>
            <p className="text-xs text-red-700 dark:text-red-200 mt-0.5 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border-2 border-emerald-500/30 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-200 text-sm flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium text-emerald-900 dark:text-white">{successMsg}</span>
        </div>
      )}

      {/* Name Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
          Your Name
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Samuel Eyu"
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-900 dark:text-white placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Phone Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0959828576"
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-900 dark:text-white placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      {/* 6-Character Access Code Boxes */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            6-Character Access Code
          </label>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Enter</span>
        </div>
        
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {codeDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {inputRefs.current[idx] = el;}}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-full h-14 text-center text-2xl font-black font-mono tracking-wider rounded-xl bg-white border-2 border-slate-300 text-indigo-700 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/25 dark:bg-slate-900/95 dark:border-slate-600 dark:text-indigo-300 dark:focus:border-indigo-400 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/40 uppercase transition-all outline-none shadow-sm dark:shadow-md"
            />
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/35 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 border border-white/20"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Verifying Code...</span>
          </>
        ) : (
          <>
            <span>Activate & Watch Video</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
