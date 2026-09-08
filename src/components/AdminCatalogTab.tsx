'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Disc, Music, Trash2, Edit3, Loader2, Image, Layers } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export function AdminCatalogTab() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Album Modal State
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumArtist, setAlbumArtist] = useState('');
  const [albumCoverUrl, setAlbumCoverUrl] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);

  // New Song Modal State
  const [showSongModal, setShowSongModal] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songR2Key, setSongR2Key] = useState('');
  const [songDuration, setSongDuration] = useState('210');
  const [songTrackNo, setSongTrackNo] = useState('1');
  const [creatingSong, setCreatingSong] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/admin/albums');
      setAlbums(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAlbum(true);
    try {
      await apiFetch('/admin/albums', {
        method: 'POST',
        body: JSON.stringify({
          title: albumTitle.trim(),
          artist: albumArtist.trim(),
          coverUrl: albumCoverUrl.trim() || undefined,
        }),
      });
      setShowAlbumModal(false);
      setAlbumTitle('');
      setAlbumArtist('');
      setAlbumCoverUrl('');
      fetchCatalog();
    } catch (err: any) {
      alert(err.message || 'Failed to create album');
    } finally {
      setCreatingAlbum(false);
    }
  };

  const handleCreateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingSong(true);
    try {
      await apiFetch('/admin/songs', {
        method: 'POST',
        body: JSON.stringify({
          albumId: selectedAlbumId,
          title: songTitle.trim(),
          r2Key: songR2Key.trim(),
          duration: parseInt(songDuration, 10) || undefined,
          trackNo: parseInt(songTrackNo, 10) || undefined,
        }),
      });
      setShowSongModal(false);
      setSongTitle('');
      setSongR2Key('');
      fetchCatalog();
    } catch (err: any) {
      alert(err.message || 'Failed to add song');
    } finally {
      setCreatingSong(false);
    }
  };

  const handleDeleteAlbum = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete album "${title}" and all its songs?`)) return;
    try {
      await apiFetch(`/admin/albums/${id}`, { method: 'DELETE' });
      fetchCatalog();
    } catch (err: any) {
      alert(err.message || 'Failed to delete album');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Album Catalog</h2>
          <p className="text-xs text-gray-400">Manage digital albums & audio files in Cloudflare R2</p>
        </div>
        <button
          onClick={() => setShowAlbumModal(true)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet text-white font-bold text-xs flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Album</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-400" />
          <span>Loading catalog...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      ) : albums.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <Disc className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Albums Found</h3>
          <p className="text-xs text-gray-400 mb-4">Create your first digital album to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {albums.map((album) => (
            <div key={album.id} className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={album.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300'}
                    alt={album.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg"
                  />
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{album.title}</h3>
                    <p className="text-xs text-gray-300 font-medium">{album.artist}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono text-gray-500">
                      ID: {album.id}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAlbum(album.id, album.title)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Delete Album"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Album Metrics */}
              <div className="flex items-center gap-4 py-2 px-3 rounded-xl bg-white/5 text-xs text-gray-300">
                <div className="flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>{album._count?.songs || 0} Songs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-accent-violet" />
                  <span>{album._count?.accessCodes || 0} Access Codes</span>
                </div>
              </div>

              {/* Add Song Button */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => {
                    setSelectedAlbumId(album.id);
                    setShowSongModal(true);
                  }}
                  className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Song Track</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Album Modal */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/15 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create New Album</h3>
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  placeholder="Neon Echoes"
                  className="w-full p-3 rounded-xl glass-input text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Artist</label>
                <input
                  type="text"
                  required
                  value={albumArtist}
                  onChange={(e) => setAlbumArtist(e.target.value)}
                  placeholder="Aura V"
                  className="w-full p-3 rounded-xl glass-input text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Cover Image URL (Optional)</label>
                <input
                  type="url"
                  value={albumCoverUrl}
                  onChange={(e) => setAlbumCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-3 rounded-xl glass-input text-sm text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAlbumModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAlbum}
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  {creatingAlbum ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Song Modal */}
      {showSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/15 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Song Track</h3>
            <form onSubmit={handleCreateSong} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Song Title</label>
                <input
                  type="text"
                  required
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Midnight Pulse"
                  className="w-full p-3 rounded-xl glass-input text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Cloudflare R2 Key</label>
                <input
                  type="text"
                  required
                  value={songR2Key}
                  onChange={(e) => setSongR2Key(e.target.value)}
                  placeholder="audio/midnight-pulse.mp3"
                  className="w-full p-3 rounded-xl glass-input text-sm text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Duration (Seconds)</label>
                  <input
                    type="number"
                    value={songDuration}
                    onChange={(e) => setSongDuration(e.target.value)}
                    placeholder="215"
                    className="w-full p-3 rounded-xl glass-input text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Track No</label>
                  <input
                    type="number"
                    value={songTrackNo}
                    onChange={(e) => setSongTrackNo(e.target.value)}
                    placeholder="1"
                    className="w-full p-3 rounded-xl glass-input text-sm text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSongModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSong}
                  className="flex-1 py-3 rounded-xl bg-accent-violet hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  {creatingSong ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Song'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
