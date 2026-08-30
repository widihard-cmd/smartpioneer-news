import { useCallback, useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';

type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
};

const tracks: Track[] = [
  {
    id: 'pioneer-voice',
    title: 'Pioneer Voice',
    artist: 'Pioneer Indonesia',
    src: '/audio/flow_tts.mp3',
  },
  {
    id: 'levy-vision',
    title: 'Levy Vision',
    artist: 'Pioneer Indonesia',
    src: '/audio/test_aura_indo.mp3',
  },
];

const ANALYTICS_KEY = 'pioneer-play-analytics';

function recordPlay(trackId: string) {
  try {
    const counts = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '{}');
    counts[trackId] = (counts[trackId] || 0) + 1;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(counts));
  } catch {
    // Audio must continue even when browser storage is unavailable.
  }
}

export default function PersistentPlayer() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState('');

  const soundRef = useRef<Howl | null>(null);
  const frameRef = useRef<number>(0);
  const countedSoundRef = useRef<Howl | null>(null);
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
      setIndex(nextIndex);
      setProgress(0);
      setError('');

      const nextTrack = tracks[nextIndex];
      const sound = new Howl({
        src: [nextTrack.src],
        html5: true,
        preload: true,
        onplay: () => {
          setPlaying(true);
          updateProgress(sound);
          if (countedSoundRef.current !== sound) {
            countedSoundRef.current = sound;
            recordPlay(nextTrack.id);
          }
        },
        onpause: () => setPlaying(false),
        onstop: () => setPlaying(false),
        onend: () => loadTrack((nextIndex + 1) % tracks.length, true),
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
    loadTrack(0);
    return () => {
      cancelAnimationFrame(frameRef.current);
      soundRef.current?.unload();
    };
  }, [loadTrack]);

  const togglePlayback = () => {
    const sound = soundRef.current;
    if (!sound) return;
    sound.playing() ? sound.pause() : sound.play();
  };

  const changeTrack = (direction: number) => {
    const nextIndex = (index + direction + tracks.length) % tracks.length;
    loadTrack(nextIndex, playing);
  };

  return (
    <div className="glass-player fixed inset-x-0 bottom-0 z-50 px-4 py-3">
      <div className="mx-auto flex max-w-screen-xl items-center gap-4">
        <button
          type="button"
          onClick={() => setDetailsOpen((value) => !value)}
          className="hidden h-11 w-11 place-items-center rounded-xl border border-gold-500/30 bg-pi-800 sm:grid"
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

        <div className="hidden w-32 sm:block">
          <div className="h-1 rounded bg-white/10">
            <div className="h-full rounded bg-gold-500" style={{ width: `${progress}%` }} />
          </div>
          <a href="/music" className="mt-2 block text-right text-[10px] text-gold-300">Playlist</a>
        </div>
      </div>

      {detailsOpen && (
        <div className="mx-auto mt-3 max-w-screen-xl border-t border-white/10 pt-3 text-xs text-pi-200/60">
          Statistik play MVP tersimpan di browser. Analytics publik akan memakai database.
        </div>
      )}
    </div>
  );
}
