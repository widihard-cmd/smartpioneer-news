import { useCallback, useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { featuredTrackIndex, tracks } from '../data/tracks';

const ANALYTICS_KEY = 'pioneer-play-analytics';
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
type RepeatMode = 'all' | 'one' | 'off';

async function recordPlay(trackId: string) {
  try {
    const counts = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '{}');
    counts[trackId] = (counts[trackId] || 0) + 1;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(counts));
    window.dispatchEvent(new CustomEvent('pioneer:analytics-updated'));
  } catch {
    // Audio must continue even when browser storage is unavailable.
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    let sessionId = localStorage.getItem('pioneer-session-id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('pioneer-session-id', sessionId);
    }
    await fetch(`${SUPABASE_URL}/rest/v1/play_events`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ track_id: trackId, session_id: sessionId, listened_seconds: 10 }),
    }).then((response) => {
      if (!response.ok) throw new Error(`Analytics request failed: ${response.status}`);
    });
  } catch (analyticsError) {
    // Local analytics remains available if the network is temporarily offline.
    console.warn('Pioneer play analytics unavailable', analyticsError);
  }
}

export default function PersistentPlayer() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [queueLabel, setQueueLabel] = useState('Seluruh koleksi');

  const soundRef = useRef<Howl | null>(null);
  const frameRef = useRef<number>(0);
  const playTimerRef = useRef<number>(0);
  const countedSoundRef = useRef<Howl | null>(null);
  const repeatModeRef = useRef<RepeatMode>('all');
  const volumeRef = useRef(0.8);
  const queueRef = useRef<string[]>(tracks.map((item) => item.id));
  const track = tracks[index];

  const updateProgress = useCallback((sound: Howl) => {
    cancelAnimationFrame(frameRef.current);
    const step = () => {
      const duration = sound.duration() || 1;
      setProgress((Number(sound.seek()) / duration) * 100);
      if (sound.playing()) frameRef.current = requestAnimationFrame(step);
    };
    step();
  }, []);

  const loadTrack = useCallback(
    (nextIndex: number, autoplay = false) => {
      soundRef.current?.unload();
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(playTimerRef.current);
      setIndex(nextIndex);
      setProgress(0);
      setError('');

      const nextTrack = tracks[nextIndex];
      const sound = new Howl({
        src: [nextTrack.src],
        html5: true,
        preload: true,
        volume: volumeRef.current,
        onplay: () => {
          setPlaying(true);
          updateProgress(sound);
          if (countedSoundRef.current !== sound) {
            countedSoundRef.current = sound;
            playTimerRef.current = window.setTimeout(() => recordPlay(nextTrack.id), 10000);
          }
        },
        onpause: () => {
          setPlaying(false);
          if (Number(sound.seek()) < 10) window.clearTimeout(playTimerRef.current);
        },
        onstop: () => setPlaying(false),
        onend: () => {
          if (repeatModeRef.current === 'one') { sound.play(); return; }
          if (repeatModeRef.current === 'all') {
            const currentQueueIndex = queueRef.current.indexOf(nextTrack.id);
            const followingId = queueRef.current[(currentQueueIndex + 1) % queueRef.current.length];
            const followingIndex = tracks.findIndex((item) => item.id === followingId);
            if (followingIndex >= 0) loadTrack(followingIndex, true);
          }
        },
        onloaderror: () => {
          setPlaying(false);
          setError('Audio belum dapat dimuat.');
        },
      });

      soundRef.current = sound;
      if (autoplay) sound.play();
    },
    [updateProgress],
  );

  useEffect(() => {
    loadTrack(featuredTrackIndex);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(playTimerRef.current);
      soundRef.current?.unload();
    };
  }, [loadTrack]);

  useEffect(() => {
    const selectTrack = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; queueIds?: string[] }>).detail;
      const id = detail?.id;
      const nextQueue = detail?.queueIds?.filter((queueId) => tracks.some((trackItem) => trackItem.id === queueId));
      if (nextQueue?.length) {
        queueRef.current = nextQueue;
        setQueueLabel('Playlist saya');
      } else {
        queueRef.current = tracks.map((item) => item.id);
        setQueueLabel('Seluruh koleksi');
      }
      const nextIndex = tracks.findIndex((item) => item.id === id);
      if (nextIndex >= 0) loadTrack(nextIndex, true);
    };
    window.addEventListener('pioneer:play-track', selectTrack);
    return () => window.removeEventListener('pioneer:play-track', selectTrack);
  }, [loadTrack]);

  useEffect(() => {
    try {
      const favorites: string[] = JSON.parse(localStorage.getItem('pioneer-favorites') || '[]');
      setFavorite(favorites.includes(track.id));
    } catch {
      setFavorite(false);
    }
  }, [track.id]);

  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);

  const togglePlayback = () => {
    const sound = soundRef.current;
    if (!sound) return;
    sound.playing() ? sound.pause() : sound.play();
  };

  const changeTrack = (direction: number) => {
    const currentQueueIndex = queueRef.current.indexOf(track.id);
    const nextId = queueRef.current[(currentQueueIndex + direction + queueRef.current.length) % queueRef.current.length];
    const nextIndex = tracks.findIndex((item) => item.id === nextId);
    loadTrack(nextIndex, playing);
  };

  const changeVolume = (nextVolume: number) => {
    volumeRef.current = nextVolume;
    setVolume(nextVolume);
    soundRef.current?.volume(nextVolume);
    try { localStorage.setItem('pioneer-volume', String(nextVolume)); } catch { /* optional preference */ }
  };

  const cycleRepeat = () => setRepeatMode((mode) => mode === 'all' ? 'one' : mode === 'one' ? 'off' : 'all');

  const toggleFavorite = () => {
    try {
      const favorites: string[] = JSON.parse(localStorage.getItem('pioneer-favorites') || '[]');
      const next = favorites.includes(track.id)
        ? favorites.filter((id) => id !== track.id)
        : [...favorites, track.id];
      localStorage.setItem('pioneer-favorites', JSON.stringify(next));
      setFavorite(next.includes(track.id));
      window.dispatchEvent(new CustomEvent('pioneer:favorites-updated'));
    } catch {
      setFavorite(false);
    }
  };

  return (
    <div className="glass-player fixed inset-x-0 bottom-0 z-50 px-4 py-3">
      <div className="mx-auto flex max-w-screen-xl items-center gap-4">
        <button
          type="button"
          onClick={() => setDetailsOpen((value) => !value)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold-500/30 bg-pi-800"
          aria-label="Tampilkan informasi player"
        >
          π
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{track.title}</p>
          <p className="truncate text-xs text-pi-200/50">{error || track.artist}</p>
        </div>

        <div className="hidden items-end gap-1 md:flex" aria-label="Visual equalizer">
          {[12, 22, 16, 28, 19, 25, 14, 30, 18].map((height, barIndex) => (
            <i
              key={barIndex}
              className={playing ? 'eq-bar playing' : 'eq-bar'}
              style={{ height }}
            />
          ))}
        </div>

        <button type="button" onClick={() => changeTrack(-1)} aria-label="Lagu sebelumnya">⏮</button>
        <button
          type="button"
          onClick={togglePlayback}
          className="grid h-11 w-11 place-items-center rounded-full bg-gold-500 font-bold text-pi-950"
          aria-label={playing ? 'Jeda' : 'Putar'}
        >
          {playing ? 'Ⅱ' : '▶'}
        </button>
        <button type="button" onClick={() => changeTrack(1)} aria-label="Lagu berikutnya">⏭</button>
        <button type="button" onClick={cycleRepeat} className={repeatMode === 'off' ? 'text-pi-200/40' : 'text-gold-300'} aria-label={repeatMode === 'one' ? 'Ulang lagu ini aktif' : repeatMode === 'all' ? 'Ulang playlist aktif' : 'Ulang mati'}>
          {repeatMode === 'one' ? '↻¹' : '↻'}
        </button>
        <button
          type="button"
          onClick={toggleFavorite}
          className={favorite ? 'text-gold-300' : 'text-pi-200/60'}
          aria-label={favorite ? 'Hapus dari playlist favorit' : 'Tambah ke playlist favorit'}
        >
          {favorite ? '♥' : '♡'}
        </button>

        <div className="hidden w-32 sm:block">
          <div className="h-1 rounded bg-white/10">
            <div className="h-full rounded bg-gold-500" style={{ width: `${progress}%` }} />
          </div>
          <a href="/music" className="mt-2 block text-right text-[10px] text-gold-300">Playlist</a>
        </div>

        <label className="hidden items-center gap-2 lg:flex" title={`Volume ${Math.round(volume * 100)}%`}>
          <span className="text-sm text-pi-200/65">{volume === 0 ? '🔇' : '🔊'}</span>
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => changeVolume(Number(event.target.value))} className="h-1 w-20 accent-gold-500" aria-label="Volume" />
        </label>
      </div>

      {detailsOpen && (
        <div className="mx-auto mt-3 max-w-screen-xl border-t border-white/10 pt-3 text-xs text-pi-200/60">
          <div className="flex flex-wrap items-center justify-between gap-3"><span>{queueLabel} · {tracks.length} lagu · play dihitung setelah didengarkan 10 detik.</span><label className="flex items-center gap-2">Volume <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => changeVolume(Number(event.target.value))} className="w-28 accent-gold-500" aria-label="Volume" /></label></div>
        </div>
      )}
    </div>
  );
}
