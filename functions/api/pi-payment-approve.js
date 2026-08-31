import { piRequest, readBody, response, validPurchase, verifyPurchase } from '../_lib/pi-payment.js';

export async function onRequestPost({ request, env }) {
  const body = await readBody(request);
  if (!validPurchase(body)) return response({ error: 'Data pembayaran tidak lengkap.' }, 400);
  try {
    await verifyPurchase(body, env);
    await piRequest(`/payments/${encodeURIComponent(body.paymentId)}/approve`, env, { method: 'POST', body: '{}' });
    return response({ ok: true });
  } catch (error) {
    return response({ error: error.message || 'Persetujuan pembayaran gagal.' }, 502);
  }
}
