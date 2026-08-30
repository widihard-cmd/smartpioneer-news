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
];

export const featuredTrackIndex = Math.max(0, tracks.findIndex((track) => track.featured));
