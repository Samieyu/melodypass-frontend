'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Plus, Search, Loader2, KeyRound, CheckCircle, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { QRCodeModal } from './QRCodeModal';

export function AdminAccessCodesTab() {
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState('');

  // Bulk Generation State
  const [showGenModal, setShowGenModal] = useState(false);
  const [genAlbumId, setGenAlbumId] = useState('');
  const [genCount, setGenCount] = useState('10');
  const [generating, setGenerating] = useState(false);

  // QR Modal State
  const [activeQrCode, setActiveQrCode] = useState<{ code: string; albumTitle: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [codesData, albumsData] = await Promise.all([
        apiFetch('/admin/access-codes'),
        apiFetch('/admin/albums'),
      ]);
      setAccessCodes(codesData);
      setAlbums(albumsData);
      if (albumsData.length > 0 && !genAlbumId) {
        setGenAlbumId(albumsData[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genAlbumId) return alert('Please select an album');
    setGenerating(true);
    try {
      const res = await apiFetch('/admin/access-codes/generate', {
        method: 'POST',
        body: JSON.stringify({
          albumId: genAlbumId,
          count: parseInt(genCount, 10) || 10,
        }),
      });
      alert(`Successfully generated ${res.count} new access codes!`);
      setShowGenModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to generate codes');
    } finally {
      setGenerating(false);
    }
  };

  const filteredCodes = accessCodes.filter((ac) => {
    const matchesSearch = ac.code.toLowerCase().includes(search.toLowerCase()) ||
      (ac.user && ac.user.name.toLowerCase().includes(search.toLowerCase()));
    const matchesAlbum = !selectedAlbumId || ac.albumId === selectedAlbumId;
    return matchesSearch && matchesAlbum;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Access Codes</h2>
          <p className="text-xs text-gray-400">Generate, view & print 6-character QR codes for physical album passes</p>
        </div>
        <button
          onClick={() => setShowGenModal(true)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet text-white font-bold text-xs flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Bulk Generate Codes</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or user name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white"
          />
        </div>
        <select
          value={selectedAlbumId}
          onChange={(e) => setSelectedAlbumId(e.target.value)}
          className="py-2.5 px-4 rounded-xl glass-input text-xs text-white bg-neutral-900 border border-white/10"
        >
          <option value="">All Albums</option>
          {albums.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      </div>

      {/* Access Codes Table */}
      {loading ? (
        <div className="py-12 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-400" />
          <span>Loading access codes...</span>
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <KeyRound className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Access Codes</h3>
          <p className="text-xs text-gray-400 mb-4">Click "Bulk Generate Codes" to create pass codes for an album.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pass Code</th>
                  <th className="py-3.5 px-4">Album</th>
                  <th className="py-3.5 px-4">Status & Binding</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredCodes.map((ac) => {
                  const isBound = !!ac.sessionToken && !!ac.user;
                  return (
                    <tr key={ac.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-sm tracking-widest text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                          {ac.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-200">
                        {ac.album?.title || 'Unknown Album'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isBound ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Bound to {ac.user?.name} ({ac.user?.phone})</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Unbound / Available</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveQrCode({ code: ac.code, albumTitle: ac.album?.title || 'Album Pass' })}
                          className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5 text-accent-cyan" />
                          <span>View QR</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/15 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Bulk Generate Access Codes</h3>
            <form onSubmit={handleGenerateCodes} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Select Album</label>
                <select
                  value={genAlbumId}
                  onChange={(e) => setGenAlbumId(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-sm text-white bg-neutral-900"
                >
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} by {a.artist}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Number of Codes to Generate</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={genCount}
                  onChange={(e) => setGenCount(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-sm text-white"
                />
                <p className="text-[11px] text-gray-500 mt-1">Codes use 6 uppercase characters, excluding ambiguous 0/O, 1/I/L.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Codes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Preview Modal */}
      {activeQrCode && (
        <QRCodeModal
          code={activeQrCode.code}
          albumTitle={activeQrCode.albumTitle}
          onClose={() => setActiveQrCode(null)}
        />
      )}
    </div>
  );
}
