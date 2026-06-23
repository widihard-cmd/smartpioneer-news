/**
 * PersistentPlayer.tsx
 * Komponen React audio player yang persisten lintas navigasi halaman.
 *
 * Fitur:
 * - Play/pause/next/prev
 * - Progress bar scrubable
 * - Volume control
 * - Playlist support
 * - Minimize/expand UI
 * - Tetap hidup via `transition:persist` (Astro View Transitions)
 *
 * Dependencies: howler (npm install howler @types/howler)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';

// ─── Types ────────────────────────────────────────────────────
interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover?: string;
}

// ─── Default Playlist ──────────────────────────────────────────
// Ganti src dengan URL audio asli Anda di /public/audio/
const DEFAULT_PLAYLIST: Track[] = [
  {
    id: '1',
    title: 'Pi Network Official Theme',
    artist: 'SmartPioneer Radio',
    src: '/audio/flow_tts.mp3',
    cover: '/images/cover-pi.jpg',
  },
  {
    id: '2',
    title: 'Blockchain Beats Vol.1',
    artist: 'SmartPioneer Radio',
    src: '/audio/test_aura_indo.mp3',
    cover: '/images/cover-beats.jpg',
  },
];

// ─── Utility ──────────────────────────────────────────────────
function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Component ────────────────────────────────────────────────
export default function PersistentPlayer() {
  const [playlist] = useState<Track[]>(DEFAULT_PLAYLIST);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [seek, setSeek] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const howlRef = useRef<Howl | null>(null);
  const rafRef = useRef<number>(0);
  const seekBarRef = useRef<HTMLInputElement>(null);

  const currentTrack = playlist[currentIndex];

  // ── Build / rebuild Howl when track changes ──────────────────
  const loadTrack = useCallback(
    (index: number, autoPlay = false) => {
      if (howlRef.current) {
        howlRef.current.unload();
        cancelAnimationFrame(rafRef.current);
      }

      const track = playlist[index];
      setIsLoading(true);
      setSeek(0);
      setDuration(0);

      const sound = new Howl({
        src: [track.src],
        html5: true, // streaming-friendly
        volume,
        onload: () => {
          setDuration(sound.duration());
          setIsLoading(false);
          if (autoPlay) {
            sound.play();
            setIsPlaying(true);
            startRaf(sound);
          }
        },
        onplay: () => {
          setIsPlaying(true);
          startRaf(sound);
        },
        onpause: () => {
          setIsPlaying(false);
          cancelAnimationFrame(rafRef.current);
        },
        onstop: () => {
          setIsPlaying(false);
          setSeek(0);
          cancelAnimationFrame(rafRef.current);
        },
        onend: () => {
          // Auto-advance to next track
          handleNext(index);
        },
        onloaderror: () => {
          setIsLoading(false);
          console.warn('[SmartPioneer Player] Failed to load:', track.src);
        },
      });

      howlRef.current = sound;
    },
    [playlist, volume]
  );

  // ── RAF loop for progress ────────────────────────────────────
  const startRaf = (sound: Howl) => {
    const step = () => {
      const s = sound.seek() as number;
      setSeek(s);
      if (sound.playing()) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  // ── Init on mount ────────────────────────────────────────────
  useEffect(() => {
    loadTrack(0, false);
    return () => {
      howlRef.current?.unload();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Volume sync ──────────────────────────────────────────────
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume);
    }
    Howler.volume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // ── Controls ─────────────────────────────────────────────────
  const handlePlayPause = () => {
    const sound = howlRef.current;
    if (!sound) return;
    if (sound.playing()) {
      sound.pause();
    } else {
      sound.play();
    }
  };

  const handleNext = (fromIndex?: number) => {
    const idx = ((fromIndex ?? currentIndex) + 1) % playlist.length;
    setCurrentIndex(idx);
    loadTrack(idx, true);
  };

  const handlePrev = () => {
    // If > 3s played, restart; else go to prev
    if (seek > 3) {
      howlRef.current?.seek(0);
      setSeek(0);
      return;
    }
    const idx = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(idx);
    loadTrack(idx, isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    howlRef.current?.seek(val);
    setSeek(val);
  };

  const handleTrackSelect = (index: number) => {
    setCurrentIndex(index);
    loadTrack(index, true);
  };

  // ── Progress percentage for CSS fill ─────────────────────────
  const progressPct = duration > 0 ? (seek / duration) * 100 : 0;

  // ─── UI ───────────────────────────────────────────────────────
  return (
    <div
      className="glass-player fixed bottom-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ height: isMinimized ? '40px' : '72px' }}
      aria-label="Audio Player"
      role="region"
    >
      {/* Minimized bar */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full h-full flex items-center justify-center gap-3 text-xs text-pi-300/70 hover:text-gold-500 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
          {isPlaying ? '▶ ' : '⏸ '}
          {currentTrack.title} — {currentTrack.artist}
          <span className="ml-2 opacity-50">▲ expand</span>
        </button>
      ) : (
        <div className="h-full flex items-center gap-4 px-4 max-w-screen-xl mx-auto">

          {/* Track info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-pi-800/60 border border-gold-500/20 flex items-center justify-center shrink-0 overflow-hidden">
              {currentTrack.cover ? (
                <img src={currentTrack.cover} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gold-500 text-lg">♪</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {currentTrack.title}
              </p>
              <p className="text-xs text-pi-300/60 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-1.5 flex-1 max-w-md">
            {/* Buttons */}
            <div className="flex items-center gap-5">
              <button
                onClick={handlePrev}
                className="text-pi-300/60 hover:text-gold-500 transition-colors text-lg leading-none"
                aria-label="Sebelumnya"
              >
                ⏮
              </button>

              <button
                onClick={handlePlayPause}
                disabled={isLoading}
                className="w-9 h-9 rounded-full bg-gold-500 hover:bg-gold-300 text-pi-900 flex items-center justify-center font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <span className="animate-spin text-xs">⟳</span>
                ) : isPlaying ? (
                  '⏸'
                ) : (
                  '▶'
                )}
              </button>

              <button
                onClick={() => handleNext()}
                className="text-pi-300/60 hover:text-gold-500 transition-colors text-lg leading-none"
                aria-label="Berikutnya"
              >
                ⏭
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-pi-300/50 tabular-nums w-8 text-right">
                {formatTime(seek)}
              </span>
              <div className="relative flex-1 h-1 group">
                <div className="absolute inset-y-0 left-0 w-full bg-pi-800/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-500 rounded-full transition-none"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <input
                  ref={seekBarRef}
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={seek}
                  onChange={handleSeek}
                  className="audio-progress absolute inset-0 w-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'transparent' }}
                  aria-label="Progress"
                />
              </div>
              <span className="text-xs text-pi-300/50 tabular-nums w-8">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume + Minimize */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-pi-300/50 hover:text-gold-500 transition-colors text-sm"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="audio-progress w-20 hidden sm:block"
              aria-label="Volume"
            />
            <button
              onClick={() => setIsMinimized(true)}
              className="text-pi-300/30 hover:text-pi-300/70 transition-colors text-xs ml-1"
              aria-label="Minimize player"
            >
              ▼
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
