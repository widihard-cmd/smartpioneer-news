import { piRequest, readBody, response, validPurchase, verifyPurchase } from './pi-payment-utils.mjs';

export default async (request) => {
  if (request.method !== 'POST') return response({ error: 'Method tidak diizinkan.' }, 405);
  const body = await readBody(request);
  if (!validPurchase(body) || typeof body.txid !== 'string' || !body.txid) return response({ error: 'Data transaksi tidak lengkap.' }, 400);

  try {
    await verifyPurchase(body);
    await piRequest(`/payments/${encodeURIComponent(body.paymentId)}/complete`, {
      method: 'POST',
      body: JSON.stringify({ txid: body.txid }),
    });
    return response({ ok: true });
  } catch (error) {
    return response({ error: error.message || 'Penyelesaian pembayaran gagal.' }, 502);
  }
};
