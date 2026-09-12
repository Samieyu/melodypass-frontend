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
  Video,
  Loader2,
  Lock,
  Sparkles,
  Maximize2,
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
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const mediaRef = useRef<HTMLVideoElement | null>(null);
  const currentSong = album.songs[currentTrackIndex];

  // Sync volume
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Fetch stream URL dynamically right before playback starts
  const playTrack = async (index: number) => {
    const song = album.songs[index];
    if (!song) return;

    setCurrentTrackIndex(index);
    setStreamError(null);
    setLoadingStreamUrl(true);

    try {
      // Fetch stream URL (either signed R2 or direct URL)
      const res = await apiFetch<{ streamUrl: string }>(`/songs/${song.id}/stream-url`);
      
      if (mediaRef.current) {
        // Resolve absolute URL if relative
        const resolvedUrl = res.streamUrl.startsWith('http')
          ? res.streamUrl
          : `${window.location.origin}${res.streamUrl.startsWith('/') ? '' : '/'}${res.streamUrl}`;

        console.log('Playing video stream URL:', resolvedUrl);
        mediaRef.current.src = resolvedUrl;
        mediaRef.current.load(); // Vital for browser media engine to load new source

        try {
          await mediaRef.current.play();
          setIsPlaying(true);
        } catch (playErr: any) {
          console.warn('Play interrupted or requires interaction:', playErr);
          // If auto-play was blocked or failed, keep isPlaying false but src loaded
        }
      }
    } catch (err: any) {
      console.error('Playback stream error:', err);
      setStreamError(err.message || 'Failed to stream media');
      setIsPlaying(false);
    } finally {
      setLoadingStreamUrl(false);
    }
  };

  const togglePlayPause = () => {
    if (!mediaRef.current) return;

    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!mediaRef.current.src || mediaRef.current.src === window.location.href) {
        playTrack(currentTrackIndex);
      } else {
        mediaRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
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
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
    }
  };

  const handleToggleFullscreen = () => {
    if (!mediaRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      if (mediaRef.current.requestFullscreen) {
        mediaRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const coverImage = album.coverUrl || '/album-cover.jpg';

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Video / Cinema Player Screen */}
      <div className="glass-panel rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-violet/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 group">
          {/* HTML5 Video Element */}
          <video
            ref={mediaRef}
            poster={coverImage}
            playsInline
            preload="metadata"
            onTimeUpdate={() => mediaRef.current && setCurrentTime(mediaRef.current.currentTime)}
            onLoadedMetadata={() => mediaRef.current && setDuration(mediaRef.current.duration)}
            onEnded={handleNext}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={(e) => {
              const video = e.currentTarget;
              console.error('Video load error:', video.error, 'Source was:', video.src);
              
              // If it failed loading /videos/nkan-zare.mp4, try fallback to /video.mp4
              if (video.src && video.src.includes('/videos/nkan-zare.mp4')) {
                console.log('Retrying with fallback /video.mp4...');
                video.src = `${window.location.origin}/video.mp4`;
                video.load();
                video.play().catch(() => {});
                return;
              }

              setStreamError('Could not play video source. If using Cloudflare R2, make sure CORS is enabled on the bucket.');
              setIsPlaying(false);
            }}
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlayPause}
          />

          {/* Overlay when paused */}
          {!isPlaying && !loadingStreamUrl && (
            <div
              onClick={togglePlayPause}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-opacity"
            >
              <div className="w-16 h-16 rounded-full bg-brand-600/90 hover:bg-brand-500 text-white flex items-center justify-center shadow-2xl shadow-brand-500/50 transform group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <p className="mt-3 text-xs font-semibold text-white/90 drop-shadow">
                Click to Watch Video
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {loadingStreamUrl && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-2" />
              <p className="text-xs font-medium text-gray-300">Loading Video Stream...</p>
            </div>
          )}

          {/* Top Info Bar inside Video */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-emerald-400 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Official Video Access</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFullscreen();
              }}
              className="pointer-events-auto p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Artist Info Below Screen */}
        <div className="px-2 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {album.title}
            </h1>
            <p className="text-sm font-medium text-accent-cyan mt-0.5">{album.artist}</p>
          </div>
          <div className="text-xs text-gray-400 font-mono">
            {album.songs.length} Video Track • HD Playback
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 space-y-2 border border-white/10">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
          Video Tracklist
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
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 font-bold text-xs font-mono text-gray-400">
                {isSelected && isPlaying ? (
                  <Loader2 className="w-4 h-4 text-accent-cyan animate-spin" />
                ) : (
                  <Video className="w-4 h-4 text-brand-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-brand-300' : 'text-gray-200'}`}>
                  {song.title}
                </p>
                <p className="text-xs text-gray-400">{album.artist}</p>
              </div>

              <div className="text-xs font-mono text-gray-400 shrink-0">
                {song.duration ? formatTime(song.duration) : '--:--'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating Sticky Player Controls */}
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
                <Video className="w-5 h-5 text-brand-400" />
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
