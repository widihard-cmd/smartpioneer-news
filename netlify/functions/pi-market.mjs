const API_BASE = 'https://api.coingecko.com/api/v3';
const COIN_ID = 'pi-network';

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
};

function number(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export default async () => {
  try {
    const apiHeaders = { Accept: 'application/json' };
    if (process.env.COINGECKO_API_KEY) apiHeaders['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;

    const [priceResponse, ohlcResponse] = await Promise.all([
      fetch(`${API_BASE}/simple/price?ids=${COIN_ID}&vs_currencies=idr,usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`, { headers: apiHeaders }),
      fetch(`${API_BASE}/coins/${COIN_ID}/ohlc?vs_currency=idr&days=7&precision=full`, { headers: apiHeaders }),
    ]);
    if (!priceResponse.ok) throw new Error(`CoinGecko price request failed: ${priceResponse.status}`);

    const quote = (await priceResponse.json())[COIN_ID];
    if (!quote) throw new Error('Pi Network quote was not returned by CoinGecko');
    const rawOhlc = ohlcResponse.ok ? await ohlcResponse.json() : [];
    const candles = Array.isArray(rawOhlc) ? rawOhlc.map(([time, open, high, low, close]) => ({ time: number(time), open: number(open), high: number(high), low: number(low), close: number(close) })).filter((candle) => Object.values(candle).every((value) => value !== null)) : [];

    return { statusCode: 200, headers, body: JSON.stringify({ source: 'CoinGecko', symbol: 'PI', currency: 'IDR', updatedAt: number(quote.last_updated_at) ? new Date(quote.last_updated_at * 1000).toISOString() : new Date().toISOString(), price: number(quote.idr), priceUsd: number(quote.usd), change24h: number(quote.idr_24h_change), marketCap: number(quote.idr_market_cap), volume24h: number(quote.idr_24h_vol), candles }) };
  } catch {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'Data Pi Market sementara belum tersedia. Silakan coba lagi beberapa saat.', source: 'CoinGecko' }) };
  }
};
