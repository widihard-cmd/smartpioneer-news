# Pioneer Indonesia Portal

Portal premium ungu-gold untuk Pi Music, Levy Vision, Pi Market, dan Pi News.

## Menjalankan lokal

```sh
npm install
npm run dev
```

Validasi produksi: `npm run validate`. Perintah ini membuat build statis di `dist/` yang dapat dipublish di Netlify.

## Status fitur

- Home, navigasi, dan responsive shell: siap.
- Persistent Pi Music player dan visual equalizer: MVP siap.
- Play analytics: tersimpan lokal di browser; backend produksi belum dipasang.
- Playlist akun: memerlukan autentikasi dan database.
- Pi Market: placeholder transparan; API data belum dipilih.
- Pi News: struktur kanal siap; pipeline editorial/API perlu disambungkan.

Tahap berikutnya disarankan memakai Supabase untuk login, playlist, likes, dan event play. Market/news sebaiknya melalui endpoint server-side terjadwal agar API key aman dan tersedia fallback.
