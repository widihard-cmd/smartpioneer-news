export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  src: string;
  duration: string;
  durationSeconds: number;
  featured?: boolean;
};

const storageBase =
  'https://bsckhgearqcsvhloybvx.supabase.co/storage/v1/object/public/music';

export const tracks: Track[] = [
  { id: 'detak-jantung-koin-pi', title: 'Detak Jantung Koin Pi', artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/01-detak-jantung-koin-pi.mp3`, duration: '03:03', durationSeconds: 183.6 },
  { id: 'doktor-nicolas-versi-2', title: 'Doktor Nicolas (Versi 2)', artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/02-doktor-nicolas-versi-2.mp3`, duration: '03:26', durationSeconds: 206.76 },
  { id: 'golden-opportunity', title: 'Golden Opportunity', artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/03-golden-opportunity.mp3`, duration: '02:15', durationSeconds: 135 },
  { id: 'koin-pi-aliran-kemajuan-bangsa-revamp', title: 'Koin Pi: Aliran Kemajuan Bangsa (Revamp)', artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/04-koin-pi-aliran-kemajuan-bangsa-revamp.mp3`, duration: '03:53', durationSeconds: 233.84 },
  { id: 'nada-pioneer', title: 'Nada Pioneer', artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/05-nada-pioneer.mp3`, duration: '03:35', durationSeconds: 215.44, featured: true },
  { id: 'pi-menuju-harapan-cover-female', title: 'Pi Menuju Harapan (Cover Female)', artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/06-pi-menuju-harapan-cover-female.mp3`, duration: '03:41', durationSeconds: 221.08 },
  { id: 'pi-network-mugen-tsukuyomi', title: 'Pi Network 無限月読', artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/07-pi-network-mugen-tsukuyomi.mp3`, duration: '04:42', durationSeconds: 282.6 },
  { id: 'pi-network-impian-tanpa-batas', title: 'Pi Network: Impian Tanpa Batas', artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/08-pi-network-impian-tanpa-batas.mp3`, duration: '03:39', durationSeconds: 219.96 },
  { id: 'pioneer-to-the-moon', title: 'Pioneer To The Moon', artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/09-pioneer-to-the-moon.mp3`, duration: '03:19', durationSeconds: 199.92 },
  { id: 'sebuah-ramalan-revamp', title: 'Sebuah Ramalan (Revamp)', artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/10-sebuah-ramalan-revamp.mp3`, duration: '03:36', durationSeconds: 216.92 },
  { id: 'tabungan-rakyat-revamp', title: 'Tabungan Rakyat (Revamp)', artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/11-tabungan-rakyat-revamp.mp3`, duration: '03:54', durationSeconds: 234.16 },
  { id: 'the-wheel-of-life-is-always-turning-revamp', title: 'The Wheel of Life is Always Turning (Revamp)', artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/12-the-wheel-of-life-is-always-turning-revamp.mp3`, duration: '03:14', durationSeconds: 194.44 },
  ...[
    ['3000 Pi dalam sebuah doa.mp3',364],['asy-Syukr min al-Pioneer.mp3',188.96],['Ayahku Pioneer Pi.mp3',219.92],['Berkah Pi di hari raya.mp3',214.08],['Berlian Baru (revamp).mp3',153.16],['Blockchain Pi (Clear Female Vocal Mix).mp3',182.76],['Blockchain Pi (revamp).mp3',208.64],['Blockchain Pi Network .mp3',240],['buatku penasaran (remastered).mp3',180.64],['Buatku Penasaran (revamp).mp3',270],['Bukan Masalahmu (revamp).mp3',209.44],['California Begins.mp3',188.6],['Doktor Nicolas.mp3',214.36],['Eternal Love On The Pi Blockchain (revamp).mp3',229.96],['Hold Your Pi Coins (versi 2).mp3',214.08],['I wonder why you think that way.mp3',141.28],['Keajaiban Koin Pi.mp3',204.76],['Keberuntungan Yang Pasti (versi 2).mp3',203.04],['Keberuntungan Yang Pasti.mp3',184.24],['Kisah Pioneer Yang Abadi.mp3',201.64],['Koin Pi _ Aliran Kemajuan Bangsa.mp3',198.56],['Koin Pi Di Ujung Nasibku (revamp).mp3',207.96],['Koin Pi Di Ujung Nasibku remastered.mp3',169.48],['Maafkan Tak Bisa Klik Petir (revamp).mp3',294.92],['Mine Pi With Love (revamp).mp3',213.96],['Nada Pioneer DJ House.mp3',172.76],['Nasib Berkata Lain (revamp).mp3',201.96],['No Hero Without Joker (female).mp3',194.96],['Penyesalan Terlambat (revamp).mp3',194.4],['Philosophy Pioneer (revamp).mp3',197.4],['Philosopy Pioneer (remastered).mp3',162.92],['Pi 3.14 On Circle Life (revamp).mp3',161.8],['Pi Menuju Harapan (Cover).mp3',193.4],['Pi Menuju Harapan (revamp).mp3',167.36],['Pi Menuju Harapan.mp3',183.2],['Pioneer Pemenang (part 2).mp3',193.88],['Pioneer Victory (revamp).mp3',203.76],['Pioneer Yang Berpikir (versi 2).mp3',194.56],['Pioneers Timeless Tree (versi 2).mp3',222.88],['Rich in Pi Coins.mp3',206.88],['Semakin _ Panic Buy Pi.mp3',207.6],['The New King Of Crypto .mp3',232.04],['The Same Fate (revamp).mp3',204.2],
  ].map(([fileName, durationSeconds], extraIndex) => {
    const name = String(fileName);
    const seconds = Number(durationSeconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = String(Math.round(seconds % 60)).padStart(2, '0');
    return { id: name, title: name.replace(/\.mp3$/i, '').replace(/_/g, ' ').replace(/\s+\./g, '').replace(/\s+/g, ' ').trim(), artist: 'SmartPioneer', album: 'SmartPioneer Music', src: `${storageBase}/${encodeURIComponent(name)}`, duration: `${String(minutes).padStart(2, '0')}:${remainingSeconds}`, durationSeconds: seconds, trackNumber: extraIndex + 13 };
  }),
];

export const featuredTrackIndex = Math.max(0, tracks.findIndex((track) => track.featured));
