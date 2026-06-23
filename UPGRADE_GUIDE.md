# SmartPioneer — Panduan Upgrade Modern Futuristik

Platform berita Pi Network dengan tema deep purple/gold, glassmorphism, MP3 player persisten, dan auto-posting.

---

## Rencana Aksi Step-by-Step

### FASE 1 — Setup & Dependencies (1–2 jam)

```bash
# Clone repo Anda
git clone https://github.com/widihard-cmd/smartpioneer-news.git
cd smartpioneer-news

# Ganti package.json dengan versi baru (dari file yang diberikan)
# lalu install semua dependencies
npm install

# Salin env file
cp .env.example .env
# → Edit .env dengan kredensial Anda
```

Install tambahan:
```bash
npm install howler @types/howler
npm install framer-motion
npm install contentful @contentful/rich-text-html-renderer
npm install rss-parser slugify
```

---

### FASE 2 — Design System (1–2 jam)

1. Ganti `tailwind.config.mjs` dengan versi Pi Network theme
2. Buat `src/styles/global.css` dengan glassmorphism variables
3. Update `astro.config.mjs` dengan integrasi react, sitemap, netlify adapter
4. Tambahkan font Space Grotesk via Google Fonts (sudah ada di global.css)

---

### FASE 3 — Komponen UI (2–4 jam)

Refactor urutan prioritas:

| Komponen | File | Aksi |
|---|---|---|
| Layout root | `src/components/BaseLayout.astro` | Ganti total |
| NavBar | `src/components/NavBar.astro` | Buat baru dengan glassmorphism |
| Hero Section | `src/pages/index.astro` | Ganti total |
| News Card | `src/components/NewsCard.astro` | Buat baru |
| Article page | `src/pages/news/[slug].astro` | Buat baru |

---

### FASE 4 — Audio Player Persisten (1–2 jam)

Komponen `PersistentPlayer.tsx` menggunakan:
- **Howler.js** — audio engine cross-browser terbaik
- **React island** — di-hydrate di client, bukan server
- **`transition:persist`** — Astro directive agar komponen tidak di-unmount saat navigasi

**Cara kerja persistence:**
```
User klik link → Astro View Transitions intercept →
DOM lama di-swap → PersistentPlayer TIDAK di-destroy (transition:persist) →
Audio terus main tanpa interupsi
```

**Tambahkan audio files** ke `/public/audio/`:
```
public/
└── audio/
    ├── flow_tts.mp3        ← sudah ada di repo Anda!
    ├── test_aura_indo.mp3  ← sudah ada!
    └── (tambahkan lebih banyak...)
```

---

### FASE 4b — Auto-Posting System

**Arsitektur yang direkomendasikan: Hybrid CMS + RSS**

```
Contentful CMS          RSS Feeds
(artikel editorial)     (berita otomatis)
        ↓                      ↓
    getContentfulArticles()    fetch-news.mjs
        ↓                      ↓
    (saat build)           src/content/news/*.json
              ↓          ↓
           Astro SSG Build
                ↓
           dist/ → Netlify CDN
```

**Setup Contentful (opsional, untuk editorial):**
1. Daftar gratis di https://contentful.com
2. Buat Space baru → Content Model → "article"
3. Fields: title, slug, excerpt, body (Rich Text), coverImage, publishedAt, category, readTime
4. Dapatkan API key → masukkan ke `.env`

**Setup RSS Auto-fetch:**
```bash
# Test manual
node scripts/fetch-news.mjs

# Artikel tersimpan di:
src/content/news/2025-01-15-judul-artikel-abc123.json
```

---

### FASE 5 — Deployment & Automation (30 menit)

**1. Connect GitHub ke Netlify:**
- Netlify Dashboard → Add new site → Import from GitHub
- Build command: `npm run build`
- Publish directory: `dist`

**2. Set Environment Variables di Netlify:**
```
Netlify → Site → Environment Variables:
- CONTENTFUL_SPACE_ID
- CONTENTFUL_ACCESS_TOKEN
```

**3. Buat Build Hook di Netlify:**
```
Netlify → Site → Settings → Build & deploy → Build hooks
→ Add build hook: "auto-post"
→ Copy URL → paste ke GitHub Secret: NETLIFY_BUILD_HOOK
```

**4. Set GitHub Secrets:**
```
GitHub repo → Settings → Secrets and variables → Actions:
- NETLIFY_BUILD_HOOK = https://api.netlify.com/build_hooks/xxx
```

**5. Aktifkan GitHub Actions:**
- File `.github/workflows/auto-post.yml` sudah siap
- Actions akan berjalan setiap 6 jam otomatis
- Bisa trigger manual: GitHub → Actions → "Auto Fetch & Post News" → Run workflow

---

## Struktur Folder Final

```
smartpioneer-news/
├── .env                          # ← JANGAN commit!
├── .env.example
├── .github/
│   └── workflows/
│       └── auto-post.yml         # ← Cron auto-fetch
├── astro.config.mjs
├── netlify.toml
├── package.json
├── tailwind.config.mjs
├── public/
│   ├── audio/
│   │   ├── flow_tts.mp3
│   │   └── test_aura_indo.mp3
│   ├── favicon.svg
│   └── og-default.jpg
├── scripts/
│   └── fetch-news.mjs            # ← RSS fetcher
└── src/
    ├── components/
    │   ├── BaseLayout.astro       # ← Root layout + SEO
    │   ├── NavBar.astro           # ← Navigation glassmorphism
    │   ├── NewsCard.astro         # ← Card artikel
    │   ├── PersistentPlayer.tsx   # ← MP3 player (React island)
    │   └── HeroSection.astro      # ← Hero homepage
    ├── content/
    │   └── news/                  # ← Auto-generated JSON articles
    │       └── *.json
    ├── lib/
    │   ├── contentful.ts          # ← CMS fetcher
    │   └── audio-store.ts         # ← (opsional) Nano Stores untuk playlist
    ├── pages/
    │   ├── index.astro            # ← Homepage
    │   └── news/
    │       └── [slug].astro       # ← Article detail page
    └── styles/
        └── global.css             # ← Pi theme variables
```

---

## Tips Optimasi Lighthouse 90+

| Area | Teknik |
|---|---|
| Images | Gunakan `<Image>` dari `astro:assets`, tambahkan `loading="lazy"` |
| Fonts | `display=swap` di Google Fonts URL |
| CSS | Tailwind purge otomatis, inline critical CSS |
| JS | React hanya di-load untuk PersistentPlayer (island architecture) |
| Audio | Howler dengan `html5: true` — streaming, tidak preload penuh |
| Cache | Header `immutable` untuk assets di netlify.toml |

---

## Checklist Deploy

- [ ] `.env` terisi dengan benar
- [ ] Contentful space & content model sudah dibuat
- [ ] File audio ada di `public/audio/`
- [ ] `node scripts/fetch-news.mjs` berjalan tanpa error
- [ ] `npm run build` sukses secara lokal
- [ ] GitHub repo terhubung ke Netlify
- [ ] Environment variables diset di Netlify
- [ ] Netlify Build Hook URL disimpan sebagai GitHub Secret
- [ ] GitHub Actions berjalan sukses (cek tab Actions di GitHub)
- [ ] Lighthouse score dicek via https://pagespeed.web.dev
