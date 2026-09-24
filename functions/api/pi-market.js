const API_BASE = 'https://api.coingecko.com/api/v3';
const COIN_ID = 'pi-network';
const REFRESH_MS = 5 * 60 * 1000;

const finite = (value) => typeof value === 'number' && Number.isFinite(value) ? value : null;

export async function onRequestGet({ env, request }) {
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const cacheKey = new Request(new URL(request.url).origin + '/api/pi-market?cached=1');
  const cached = cache ? await cache.match(cacheKey) : null;
  const previous = cached ? await cached.json() : null;
  if (previous && Date.now() - Date.parse(previous.fetchedAt) < REFRESH_MS) {
    return Response.json(previous, { headers: { 'Cache-Control': 'public, max-age=60' } });
  }

  try {
    const apiHeaders = { Accept: 'application/json' };
    if (env.COINGECKO_API_KEY) apiHeaders['x-cg-demo-api-key'] = env.COINGECKO_API_KEY;
    // One request supplies the quote, ATH and key statistics.
    const marketUrl = `${API_BASE}/coins/markets?vs_currency=idr&ids=${COIN_ID}&price_change_percentage=24h`;
    let marketResponse = await fetch(marketUrl, { headers: apiHeaders });
    if (!marketResponse.ok && env.COINGECKO_API_KEY) {
      // An expired/misconfigured optional key must not disable the public quote.
      marketResponse = await fetch(marketUrl, { headers: { Accept: 'application/json' } });
    }
    if (!marketResponse.ok) throw new Error(`CoinGecko ${marketResponse.status}`);
    const market = (await marketResponse.json())?.[0];
    if (finite(market?.current_price) === null) throw new Error('Invalid CoinGecko price');

    let candles = previous?.candles || [];
    try {
      const chartResponse = await fetch(`${API_BASE}/coins/${COIN_ID}/ohlc?vs_currency=idr&days=7`, { headers: apiHeaders });
      if (chartResponse.ok) {
        const raw = await chartResponse.json();
        if (Array.isArray(raw)) candles = raw.map(([time, open, high, low, close]) => ({ time, open, high, low, close })).filter((item) => Object.values(item).every((value) => finite(value) !== null));
      }
    } catch { /* The chart is optional; never hide the quote. */ }

    const payload = {
      source: 'CoinGecko', symbol: 'PI', currency: 'IDR', fetchedAt: new Date().toISOString(), stale: false,
      updatedAt: market.last_updated || new Date().toISOString(),
      price: finite(market.current_price), priceUsd: null,
      change24h: finite(market.price_change_percentage_24h),
      marketCap: finite(market.market_cap), volume24h: finite(market.total_volume),
      athIdr: finite(market.ath), athDate: market.ath_date || null, candles,
    };
    if (cache) await cache.put(cacheKey, Response.json(payload, { headers: { 'Cache-Control': 'public, max-age=86400' } }));
    return Response.json(payload, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch {
    if (previous) return Response.json({ ...previous, stale: true }, { headers: { 'Cache-Control': 'no-store' } });
    return Response.json({ error: 'Harga Pi belum dapat diambil dari CoinGecko. Coba muat ulang sebentar lagi.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
