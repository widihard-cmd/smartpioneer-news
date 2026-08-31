export const PRICE_PI = 0.314;
export const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };

export function response(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...jsonHeaders, ...headers } });
}

export async function readBody(request) {
  try { return await request.json(); } catch { return null; }
}

export function validPurchase(body) {
  return Boolean(body && typeof body.paymentId === 'string' && body.paymentId && typeof body.trackId === 'string' && body.trackId);
}

export async function piRequest(path, env, options = {}) {
  if (!env.PI_API_KEY) throw new Error('Pi Payments belum dikonfigurasi.');
  const result = await fetch(`https://api.minepi.com/v2${path}`, {
    ...options,
    headers: { Authorization: `Key ${env.PI_API_KEY}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!result.ok) throw new Error(`Pi API merespons ${result.status}.`);
  return result.status === 204 ? null : result.json();
}

export async function verifyPurchase(body, env) {
  const payment = await piRequest(`/payments/${encodeURIComponent(body.paymentId)}`, env);
  if (Math.abs(Number(payment?.amount) - PRICE_PI) > 0.000001 || payment?.metadata?.trackId !== body.trackId) {
    throw new Error('Detail pembayaran tidak sesuai dengan lagu yang dipilih.');
  }
  return payment;
}
