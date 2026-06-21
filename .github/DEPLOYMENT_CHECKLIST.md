# SmartPioneer News - GitHub Pages Deployment Checklist

## 🎯 Tujuan
Memastikan GitHub Pages menyajikan konten Astro build (dist/) dengan benar untuk semua halaman tanpa 404.

---

## ✅ Konfigurasi yang Sudah Diterapkan

### 1. **Astro Configuration** ✓
```javascript
// astro.config.mjs
site: 'https://widihard-cmd.github.io/smartpioneer-news',
// base path dihapus agar Pages melayani dari root
```
- ✅ Site URL sudah sesuai dengan GitHub Pages domain
- ✅ Tidak ada base path conflict
- ✅ Sitemap integration aktif

### 2. **GitHub Actions Workflow** ✓
```yaml
# .github/workflows/deploy.yml
- Build: npx astro build → menghasilkan ./dist
- Upload artifact menggunakan actions/upload-pages-artifact@v3
- Deploy menggunakan actions/deploy-pages@v4
- Permissions: pages:write, id-token:write (OIDC)
```
- ✅ Workflow status: SUCCESS (runs #3-7)
- ✅ Artifact ter-upload dengan benar
- ✅ Deploy job berjalan tanpa error

### 3. **Struktur Output Build** ✓
Hasil build di `./dist/`:
```
dist/
├── index.html          (Halaman utama)
├── berita/
│   └── index.html      (Halaman berita)
├── rekomendasi/
│   └── index.html      (Halaman rekomendasi)
└── [assets, css, js]
```

---

## 🚨 KONFIGURASI YANG HARUS DIUBAH - **PRIORITAS TINGGI**

### **⚠️ GitHub Pages Source Setting** ← INI YANG PERLU DIUBAH!

**URL**: https://github.com/widihard-cmd/smartpioneer-news/settings/pages

**Langkah-langkah:**
1. Pergi ke **Settings → Pages**
2. Di bagian **"Build and deployment"** → **Source**
3. **UBAH dari**: "Deploy from a branch" 
4. **MENJADI**: **"GitHub Actions"**
5. **SIMPAN** perubahan

**Alasan:**
- GitHub Pages masih membaca dari branch `main` (hanya README.md)
- Seharusnya membaca dari artifact yang di-upload oleh GitHub Actions
- Ini adalah **root cause** mengapa halaman putih dan 404

---

## 🔍 Verifikasi Setelah Perubahan

### **Step 1**: Pastikan GitHub Pages terbaca dari GitHub Actions
- [ ] GitHub Pages setting sudah menunjukkan "GitHub Actions" sebagai source
- [ ] Tidak ada warning atau error di settings page

### **Step 2**: Trigger ulang deployment (jika perlu)
```bash
# Push perubahan sederhana untuk trigger workflow:
git commit --allow-empty -m "trigger: GitHub Pages deployment"
git push origin main

# ATAU: Manually trigger via GitHub UI
# Pergi ke: Actions → Deploy Astro site to Pages → Run workflow
```

### **Step 3**: Verifikasi deployment berhasil
- [ ] Cek Actions: workflow "Deploy Astro site to Pages" status ✅ SUCCESS
- [ ] Deployment job selesai dengan status SUCCESS
- [ ] Page URL sudah live (check Deployments tab di settings)

### **Step 4**: Test semua halaman
- [ ] https://widihard-cmd.github.io/smartpioneer-news/ → Halaman utama
- [ ] https://widihard-cmd.github.io/smartpioneer-news/berita/ → Status OK (tidak 404)
- [ ] https://widihard-cmd.github.io/smartpioneer-news/rekomendasi/ → Status OK (tidak 404)

---

## 📝 Troubleshooting Jika Masih Ada Masalah

### **Halaman masih putih atau 404:**
1. Clear browser cache: `Ctrl+Shift+Del` (Chrome) atau `Cmd+Shift+Del` (Mac)
2. Cek build output di Actions: lihat log build step
3. Pastikan file index.html ada di `dist/berita/` dan `dist/rekomendasi/`

### **Workflow failed:**
- Cek logs di: https://github.com/widihard-cmd/smartpioneer-news/actions
- Lihat error di build atau deploy step
- Verifikasi npm dependencies bisa di-resolve

### **OIDC token error:**
- Verifikasi repo sudah publish (public)
- Cek permissions di workflow: `pages: write`, `id-token: write`

---

## 📊 Workflow Diagram

```
main branch push
        ↓
   GitHub Actions trigger
        ↓
   fetch-news (jika schedule)
        ↓
   build job
   ├─ npm ci
   ├─ astro build → ./dist
   └─ upload artifact
        ↓
   deploy job
   ├─ deploy-pages@v4
   └─ Pages live ✅
        ↓
   https://widihard-cmd.github.io/smartpioneer-news/
```

---

## 🎯 Kesimpulan

**Status**: Konfigurasi workflow dan Astro sudah BENAR.
**Masalah**: GitHub Pages source masih menunjuk ke branch `main` (legacy).
**Solusi**: Ubah Pages source menjadi "GitHub Actions" di settings.

Setelah perubahan itu, semua halaman akan tersedia tanpa 404.

---

*Generated: 2026-06-21*
