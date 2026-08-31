import { useEffect, useMemo, useState } from 'react';
import { tracks } from '../data/tracks';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const readFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem('pioneer-favorites') || '[]') as string[];
  } catch {
    return [];
  }
};

const readCounts = () => {
  try {
    return JSON.parse(localStorage.getItem('pioneer-play-analytics') || '{}') as Record<string, number>;
  } catch {
    return {};
  }
};

export default function MusicLibrary() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const refresh = () => {
      setFavorites(readFavorites());
      setCounts(readCounts());
    };
    refresh();
    window.addEventListener('pioneer:favorites-updated', refresh);
    window.addEventListener('pioneer:analytics-updated', refresh);
    if (SUPABASE_URL && SUPABASE_KEY) {
      fetch(`${SUPABASE_URL}/rest/v1/rpc/get_track_play_counts`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
      })
        .then((response) => response.ok ? response.json() : [])
        .then((rows: Array<{ track_id: string; play_count: number }>) => {
          if (rows.length) setCounts(Object.fromEntries(rows.map((row) => [row.track_id, Number(row.play_count)])));
        })
        .catch(() => undefined);
    }
    return () => {
      window.removeEventListener('pioneer:favorites-updated', refresh);
      window.removeEventListener('pioneer:analytics-updated', refresh);
    };
  }, []);

  const visibleTracks = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('id-ID');
    return tracks
      .filter((track) => !favoritesOnly || favorites.includes(track.id))
      .filter((track) => !needle || `${track.title} ${track.artist} ${track.album}`.toLocaleLowerCase('id-ID').includes(needle))
      .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0) || a.title.localeCompare(b.title, 'id-ID'));
  }, [counts, favorites, favoritesOnly, query]);

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    localStorage.setItem('pioneer-favorites', JSON.stringify(next));
    setFavorites(next);
    window.dispatchEvent(new CustomEvent('pioneer:favorites-updated'));
  };

  return (
    <section className="mt-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">SmartPioneer Music</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{tracks.length} lagu · diurutkan dari paling banyak diputar</h2>
        </div>
        <button
          type="button"
          onClick={() => setFavoritesOnly((value) => !value)}
          className="rounded-full border border-gold-500/25 px-4 py-2 text-sm text-gold-300"
        >
          {favoritesOnly ? 'Tampilkan semua' : `Playlist saya (${favorites.length})`}
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[min(100%,20rem)] flex-1">
          <span className="sr-only">Cari lagu</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold-300">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul lagu atau artis…" className="w-full rounded-xl border border-white/10 bg-white/[.045] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-pi-200/35 focus:border-gold-500/60" />
        </label>
        <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-pi-200/55">{visibleTracks.length} lagu</span>
      </div>

      <div className="grid gap-3">
        {visibleTracks.map((track, index) => (
          <article key={track.id} className="glass-card flex items-center gap-4 p-4 sm:p-5">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('pioneer:play-track', { detail: { id: track.id } }))}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-500 font-bold text-pi-950"
              aria-label={`Putar ${track.title}`}
            >
              ▶
            </button>
            <p className="hidden w-7 text-center text-xs font-semibold text-gold-300/75 sm:block">#{String(index + 1).padStart(2, '0')}</p>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-white">{track.title}</h3>
              <p className="truncate text-sm text-pi-200/50">{track.artist} · {track.album}</p>
            </div>
            {track.featured && <span className="pi-badge hidden md:inline-flex">Featured</span>}
            <p className="hidden text-xs text-pi-200/45 sm:block">{counts[track.id] || 0} play</p>
            <p className="w-10 text-right text-xs text-pi-200/45">{track.duration}</p>
            <button
              type="button"
              onClick={() => toggleFavorite(track.id)}
              className={favorites.includes(track.id) ? 'text-xl text-gold-300' : 'text-xl text-pi-200/45'}
              aria-label={favorites.includes(track.id) ? 'Hapus dari playlist' : 'Tambah ke playlist'}
            >
              {favorites.includes(track.id) ? '♥' : '♡'}
            </button>
          </article>
        ))}
        {visibleTracks.length === 0 && (
          <div className="glass-card p-8 text-center text-pi-200/55">{query ? 'Lagu tidak ditemukan. Coba kata kunci lain.' : 'Belum ada lagu di playlist. Tekan ♡ pada lagu yang disukai.'}</div>
        )}
      </div>
    </section>
  );
}
