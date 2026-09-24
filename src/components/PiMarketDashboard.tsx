import { useEffect, useMemo, useState } from 'react';

type Candle = { time: number; open: number; high: number; low: number; close: number };
type MarketData = { source: string; updatedAt: string; stale?: boolean; price: number | null; change24h: number | null; marketCap: number | null; volume24h: number | null; athIdr: number | null; athDate: string | null; candles: Candle[] };
const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });

async function fetchMarket(): Promise<MarketData> {
  try {
    const response = await fetch('/api/pi-market', { cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok || typeof payload.price !== 'number') throw new Error(payload.error || 'Server pasar belum tersedia');
    return payload as MarketData;
  } catch {
    // Cloudflare's shared IP can be rate-limited even when a visitor can reach CoinGecko.
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&ids=pi-network&price_change_percentage=24h');
    if (!response.ok) throw new Error(`CoinGecko belum bisa diakses (${response.status}). Coba lagi beberapa saat.`);
    const market = (await response.json())?.[0];
    if (!market || typeof market.current_price !== 'number') throw new Error('Harga Pi belum tersedia dari CoinGecko.');
    return {
      source: 'CoinGecko', updatedAt: market.last_updated || new Date().toISOString(),
      price: market.current_price, change24h: market.price_change_percentage_24h ?? null,
      marketCap: market.market_cap ?? null, volume24h: market.total_volume ?? null,
      athIdr: market.ath ?? null, athDate: market.ath_date ?? null, candles: [],
    };
  }
}

function CandlestickChart({ candles }: { candles: Candle[] }) {
  const chart = useMemo(() => {
    if (!candles.length) return null;
    const high = Math.max(...candles.map((c) => c.high));
    const low = Math.min(...candles.map((c) => c.low));
    const range = high - low || 1;
    const y = (value: number) => 18 + (high - value) / range * 240;
    const x = (index: number) => 60 + (index + .5) / candles.length * 680;
    return { high, low, range, x, y, bodyWidth: Math.max(2, Math.min(14, 370 / candles.length)) };
  }, [candles]);
  if (!chart) return <div className="flex h-[300px] items-center justify-center text-center text-sm text-white/45">Grafik candlestick belum tersedia. Harga utama tetap dapat dilihat.</div>;
  return <svg viewBox="0 0 760 300" className="h-auto w-full" role="img" aria-label="Grafik candlestick Pi tujuh hari dalam rupiah">
    {[0, .25, .5, .75, 1].map((ratio) => <g key={ratio}><line x1="56" x2="742" y1={18 + ratio * 240} y2={18 + ratio * 240} stroke="rgba(255,255,255,.1)" /><text x="3" y={22 + ratio * 240} fontSize="11" fill="rgba(255,255,255,.6)">{compact.format(chart.high - ratio * chart.range)}</text></g>)}
    {candles.map((c, i) => { const x = chart.x(i); const color = c.close >= c.open ? '#44d7a8' : '#ff7696'; return <g key={c.time}><line x1={x} x2={x} y1={chart.y(c.high)} y2={chart.y(c.low)} stroke={color} /><rect x={x - chart.bodyWidth / 2} y={Math.min(chart.y(c.open), chart.y(c.close))} width={chart.bodyWidth} height={Math.max(2, Math.abs(chart.y(c.open) - chart.y(c.close)))} fill={color} />{i % Math.max(1, Math.ceil(candles.length / 5)) === 0 && <text x={x} y="289" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,.5)">{new Date(c.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</text>}</g>; })}
  </svg>;
}

export default function PiMarketDashboard() {
  const [data, setData] = useState<MarketData | null>(null);
  const [message, setMessage] = useState('Memuat data pasar…');
  useEffect(() => {
    let active = true;
    fetchMarket()
      .then((payload) => { if (active) { setData(payload); setMessage(''); } })
      .catch((error: Error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, []);
  const change = data?.change24h;
  return <section className="mx-auto max-w-7xl px-6 pb-14 pt-14 sm:px-10 lg:px-14">
    <div className="grid gap-6 lg:grid-cols-[.85fr_1.65fr]">
      <aside className="rounded-[2rem] border border-gold-500/25 bg-[linear-gradient(145deg,rgba(91,46,180,.38),rgba(18,8,42,.82))] p-7 shadow-2xl shadow-black/20">
        <p className="section-kicker">Pi / Rupiah</p>
        <div className="mt-6 flex items-center justify-between gap-3"><img src="/images/pi-network-logo.jpg" alt="Logo Pi Network" className="h-14 w-14 rounded-full object-cover" /><span className="rounded-full border border-gold-500/30 bg-gold-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.15em] text-gold-300">{data?.stale ? 'Data terakhir' : data ? 'Data terkini' : 'Menunggu data'}</span></div>
        <p className="mt-7 text-sm text-white/55">Harga Pi Network</p><p className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">{data?.price != null ? rupiah.format(data.price) : '—'}</p>
        <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${(change ?? 0) >= 0 ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>{change != null ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}% · 24 jam` : 'Menunggu pembaruan'}</p>
        <div className="mt-6 rounded-2xl border border-gold-500/25 bg-gold-500/[.08] p-4"><p className="text-xs font-bold uppercase tracking-[.18em] text-gold-300">All-time high Pi</p><p className="mt-2 text-2xl font-bold text-white">{data?.athIdr != null ? rupiah.format(data.athIdr) : '—'}</p><p className="mt-1 text-xs text-white/50">{data?.athDate ? `Tercatat ${new Date(data.athDate).toLocaleDateString('id-ID')} menurut CoinGecko.` : 'Menunggu data CoinGecko.'}</p><p className="mt-3 border-t border-white/10 pt-3 text-xs text-white/45">ATH adalah data historis, bukan harga saat ini.</p></div>
        <div className="mt-7 space-y-4 border-t border-white/10 pt-6">{[['Market cap', data?.marketCap], ['Volume 24 jam', data?.volume24h]].map(([label, value]) => <div key={String(label)} className="flex justify-between gap-4 text-sm"><span className="text-white/50">{label}</span><span className="text-right font-semibold text-white/85">{typeof value === 'number' ? rupiah.format(value) : '—'}</span></div>)}</div>
        <p className="mt-8 text-xs leading-relaxed text-white/40">Sumber: CoinGecko. Data pasar bukan saran finansial.</p>
      </aside>
      <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-5 sm:p-7"><p className="section-kicker">Grafik 7 hari</p><h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Pergerakan harga Pi dalam rupiah</h2><div className="mt-7 rounded-2xl border border-white/10 bg-[#0e0621]/60 p-3 sm:p-5"><CandlestickChart candles={data?.candles ?? []} /></div><p className="mt-5 text-xs text-white/55">{message || `${data?.stale ? 'CoinGecko belum bisa dijangkau. Data terakhir: ' : 'Terakhir diperbarui: '}${new Date(data!.updatedAt).toLocaleString('id-ID')}`}</p></div>
    </div>
  </section>;
}
