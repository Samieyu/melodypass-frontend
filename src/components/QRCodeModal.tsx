'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';

interface QRCodeModalProps {
  code: string;
  albumTitle: string;
  onClose: () => void;
}

export function QRCodeModal({ code, albumTitle, onClose }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/access?code=${code}`
    : `/access?code=${code}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, fullUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).catch((err) => console.error('QR code generation error:', err));
    }
  }, [fullUrl]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR-Code-${code}.png`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm glass-panel rounded-3xl p-6 border border-white/15 shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-semibold mb-4 border border-brand-500/30">
          <QrIcon className="w-3.5 h-3.5" />
          <span>Scannable Access Pass</span>
        </div>

        <h3 className="text-lg font-extrabold text-white">{albumTitle}</h3>
        <p className="text-xs text-gray-400 mb-4">Scan with camera to activate on mobile</p>

        {/* QR Canvas */}
        <div className="bg-white p-4 rounded-2xl inline-block shadow-xl mb-4">
          <canvas ref={canvasRef} className="mx-auto" />
        </div>

        {/* Code Banner */}
        <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-2 mb-6">
          <div className="text-left">
            <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest block">PASS CODE</span>
            <span className="text-lg font-bold font-mono tracking-widest text-brand-400">{code}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Actions */}
        <button
          onClick={handleDownloadQR}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
        >
          <Download className="w-4 h-4" />
          <span>Download PNG Image</span>
        </button>
      </div>
    </div>
  );
}
