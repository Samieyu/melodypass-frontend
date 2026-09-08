'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Loader2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export interface SongItem {
  id: string;
  title: string;
  duration?: number;
  trackNo?: number;
  albumId: string;
}

export interface AlbumDetails {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  songs: SongItem[];
}

interface AudioPlayerProps {
  album: AlbumDetails;
}

export function AudioPlayer({ album }: AudioPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loadingStreamUrl, setLoadingStreamUrl] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSong = album.songs[currentTrackIndex];

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Fetch presigned URL dynamically right before playback starts
  const playTrack = async (index: number) => {
    const song = album.songs[index];
    if (!song) return;

    setCurrentTrackIndex(index);
    setStreamError(null);
    setLoadingStreamUrl(true);

    try {
      // Fetch fresh signed streaming URL from API
      const res = await apiFetch<{ streamUrl: string }>(`/songs/${song.id}/stream-url`);
      
      if (audioRef.current) {
        audioRef.current.src = res.streamUrl;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.error('Playback stream error:', err);
      setStreamError(err.message || 'Failed to stream track');
      setIsPlaying(false);
    } finally {
      setLoadingStreamUrl(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src) {
        playTrack(currentTrackIndex);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
          console.error(err);
          playTrack(currentTrackIndex);
        });
      }
    }
  };

  const handleNext = () => {
    if (album.songs.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % album.songs.length;
    playTrack(nextIdx);
  };

  const handlePrev = () => {
    if (album.songs.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + album.songs.length) % album.songs.length;
    playTrack(prevIdx);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Album Header Art */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-violet/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl shrink-0 group border border-white/10">
          <img
            src={album.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800'}
            alt={album.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
              <div className="flex items-end gap-1.5 h-8">
                <div className="w-1.5 bg-brand-400 animate-[bounce_1s_infinite_100ms] h-full rounded-full" />
                <div className="w-1.5 bg-accent-cyan animate-[bounce_1s_infinite_300ms] h-3/4 rounded-full" />
                <div className="w-1.5 bg-accent-violet animate-[bounce_1s_infinite_200ms] h-full rounded-full" />
              </div>
            </div>
          )}
        </div>

        <div className="text-center sm:text-left flex-1 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unlocked Permanent Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{album.title}</h1>
          <p className="text-base font-medium text-gray-300">{album.artist}</p>
          <p className="text-xs text-gray-500">{album.songs.length} Tracks • High-Fidelity Audio</p>
        </div>
      </div>

      {/* Track List */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 space-y-2 border border-white/10">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
          Tracklist
        </h2>

        {album.songs.map((song, idx) => {
          const isSelected = idx === currentTrackIndex;
          return (
            <button
              key={song.id}
              onClick={() => playTrack(idx)}
              className={`w-full p-3.5 rounded-2xl flex items-center gap-4 transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-gradient-to-r from-brand-600/30 via-accent-violet/20 to-transparent border border-brand-500/40 text-white shadow-lg'
                  : 'hover:bg-white/5 text-gray-300'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 font-bold text-xs font-mono text-gray-400">
                {isSelected && isPlaying ? (
                  <Loader2 className="w-4 h-4 text-accent-cyan animate-spin" />
                ) : (
                  song.trackNo || idx + 1
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-brand-300' : 'text-gray-200'}`}>
                  {song.title}
                </p>
                <p className="text-xs text-gray-500">{album.artist}</p>
              </div>

              <div className="text-xs font-mono text-gray-400 shrink-0">
                {song.duration ? formatTime(song.duration) : '--:--'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating Sticky Audio Player Controls */}
      <div className="sticky bottom-4 z-40 glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/15 backdrop-blur-2xl">
        {streamError && (
          <p className="text-xs text-red-400 text-center mb-2">{streamError}</p>
        )}

        <div className="space-y-3">
          {/* Progress Seek Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-gray-400 min-w-[36px] text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <span className="text-[11px] font-mono text-gray-400 min-w-[36px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls & Track info */}
          <div className="flex items-center justify-between gap-4 pt-1">
            {/* Active song info */}
            <div className="min-w-0 flex-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5 text-brand-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentSong?.title || 'Select a track'}</p>
                <p className="text-[11px] text-gray-400 truncate">{album.artist}</p>
              </div>
            </div>

            {/* Transport controls */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handlePrev}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayPause}
                disabled={loadingStreamUrl}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-500 to-accent-violet hover:opacity-95 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 transition-transform active:scale-95 disabled:opacity-50"
              >
                {loadingStreamUrl ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Volume control */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
