export const PRICE_PI = 0.314;

export const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

export function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function validPurchase(body) {
  return Boolean(
    body
    && typeof body.paymentId === 'string'
    && body.paymentId.length > 0
    && typeof body.trackId === 'string'
    && body.trackId.length > 0,
  );
}

export async function piRequest(path, options = {}) {
  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) throw new Error('Pi Payments belum dikonfigurasi.');

  const result = await fetch(`https://api.minepi.com/v2${path}`, {
    ...options,
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!result.ok) throw new Error(`Pi API merespons ${result.status}.`);
  return result.status === 204 ? null : result.json();
}

export async function verifyPurchase(body) {
  const payment = await piRequest(`/payments/${encodeURIComponent(body.paymentId)}`);
  const amount = Number(payment?.amount);
  const trackId = payment?.metadata?.trackId;
  if (Math.abs(amount - PRICE_PI) > 0.000001 || trackId !== body.trackId) {
    throw new Error('Detail pembayaran tidak sesuai dengan lagu yang dipilih.');
  }
  return payment;
}
