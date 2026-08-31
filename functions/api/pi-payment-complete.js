import { assertPurchase, piRequest, readBody, response, validPurchase, verifyPurchase } from '../_lib/pi-payment.js';

export async function onRequestPost({ request, env }) {
  const body = await readBody(request);
  if (!validPurchase(body) || typeof body.txid !== 'string' || !body.txid) return response({ error: 'Data transaksi tidak lengkap.' }, 400);
  try {
    await verifyPurchase(body, env);
    const payment = await piRequest(`/payments/${encodeURIComponent(body.paymentId)}/complete`, env, { method: 'POST', body: JSON.stringify({ txid: body.txid }) });
    assertPurchase(payment, body);
    if (!payment?.status?.developer_completed) throw new Error('Transaksi belum dikonfirmasi oleh jaringan Pi.');
    return response({ ok: true });
  } catch (error) {
    return response({ error: error.message || 'Penyelesaian pembayaran gagal.' }, 502);
  }
}
