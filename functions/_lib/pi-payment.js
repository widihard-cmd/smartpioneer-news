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
  if (!result.ok) {
    const details = await result.json().catch(() => null);
    const message = details?.message || details?.error_message || details?.error || details?.code;
    throw new Error(message ? `Pi API: ${message}` : `Pi API merespons ${result.status}.`);
  }
  return result.status === 204 ? null : result.json();
}

export function assertPurchase(payment, body) {
  if (Math.abs(Number(payment?.amount) - PRICE_PI) > 0.000001 || payment?.metadata?.trackId !== body.trackId) {
    throw new Error('Detail pembayaran tidak sesuai dengan lagu yang dipilih.');
  }
  return payment;
}

export async function verifyPurchase(body, env) {
  return assertPurchase(await piRequest(`/payments/${encodeURIComponent(body.paymentId)}`, env), body);
}
