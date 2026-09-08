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

  // Pre-fill code if present in URL query string (e.g. from scanned QR code)
  useEffect(() => {
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

      setSuccessMsg(res.message || 'Access granted! Redirecting to album...');
      
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
      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-200">Access Denied</p>
            <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Name Input */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Your Name
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Phone Input */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 019 2831"
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* 6-Character Access Code Boxes */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
            6-Character Access Code
          </label>
          <span className="text-[10px] text-gray-500">Excludes 0/O, 1/I/L</span>
        </div>
        
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {codeDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-full h-14 text-center text-xl font-bold font-mono tracking-wider rounded-xl glass-input text-brand-400 uppercase focus:border-brand-500 border-white/10"
            />
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-brand-600 via-accent-violet to-brand-500 hover:opacity-95 text-white font-bold text-base shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Verifying Code...</span>
          </>
        ) : (
          <>
            <span>Activate & Listen</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
