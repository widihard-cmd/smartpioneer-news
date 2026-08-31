export type OfficialPiNewsItem = {
  title: string;
  summary: string;
  category: 'Developer' | 'Ekosistem' | 'Pembaruan Protokol' | 'Pi2Day';
  publishedAt: string;
  sourceUrl: string;
  featured?: boolean;
};

export const officialPiNews: OfficialPiNewsItem[] = [
  {
    title: 'Aplikasi SoloHost Baru: OpenClaw dan Atlassian MCP Server',
    summary: 'Dua aplikasi baru ditampilkan di SoloHost pada Pi Desktop, memperluas pilihan alat yang dapat dijalankan oleh komunitas developer.',
    category: 'Developer', publishedAt: '2026-08-27', sourceUrl: 'https://minepi.com/blog/new-solohost-apps/', featured: true,
  },
  {
    title: 'Pembaruan Biaya Pembuatan di Pi App Studio',
    summary: 'Pi App Studio memperbarui cara biaya pembuatan dan penyuntingan aplikasi dihitung mulai 24 Agustus 2026.',
    category: 'Developer', publishedAt: '2026-08-17', sourceUrl: 'https://minepi.com/blog/app-studio-pricing/',
  },
  {
    title: 'Pi Node Versi 0.6.2 dan Pembaruan SoloHost',
    summary: 'Rilis Pi Node 0.6.2 membawa peningkatan pada SoloHost, konektivitas Node, dan pengalaman pengelolaan aplikasi.',
    category: 'Developer', publishedAt: '2026-08-14', sourceUrl: 'https://minepi.com/blog/pi-node-0-6-2/',
  },
  {
    title: 'Rekap Pi2Day 2026',
    summary: 'Rangkuman Ecosystem Quest Pi2Day yang berlangsung 28 Juni hingga 13 Juli 2026 serta sorotan kegiatan ekosistemnya.',
    category: 'Pi2Day', publishedAt: '2026-08-05', sourceUrl: 'https://minepi.com/blog/pi2day-2026-recap/',
  },
  {
    title: 'Pi Launchpad Membagikan Token Uji SLICE',
    summary: 'Pi Launchpad menyelesaikan distribusi token Testnet kedua, SLICE, dan memperkenalkan pelacakan harga liquidity pool.',
    category: 'Ekosistem', publishedAt: '2026-07-24', sourceUrl: 'https://minepi.com/blog/launchpad-liquidity-pool/',
  },
  {
    title: 'Peningkatan Protokol v25 dan Desain Baru Mining App',
    summary: 'Pi menjadwalkan peningkatan ke Protocol v25 dengan kemampuan yang menjaga privasi serta penyempurnaan desain aplikasi mining.',
    category: 'Pembaruan Protokol', publishedAt: '2026-07-15', sourceUrl: 'https://minepi.com/blog/v25-menu-redesign/',
  },
];
