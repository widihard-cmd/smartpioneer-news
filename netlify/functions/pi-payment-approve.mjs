import { assertPurchase, piRequest, readBody, response, validPurchase, verifyPurchase } from './pi-payment-utils.mjs';

export default async (request) => {
  if (request.method !== 'POST') return response({ error: 'Method tidak diizinkan.' }, 405);
  const body = await readBody(request);
  if (!validPurchase(body)) return response({ error: 'Data pembayaran tidak lengkap.' }, 400);

  try {
    await verifyPurchase(body);
    const payment = await piRequest(`/payments/${encodeURIComponent(body.paymentId)}/approve`, { method: 'POST' });
    assertPurchase(payment, body);
    return response({ ok: true });
  } catch (error) {
    return response({ error: error.message || 'Persetujuan pembayaran gagal.' }, 502);
  }
};
