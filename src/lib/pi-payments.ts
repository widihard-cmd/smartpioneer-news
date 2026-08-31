type ProgressCallback = (message: string) => void;

async function postPayment(endpoint: string, body: Record<string, string>) {
  const result = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await result.json().catch(() => ({}));
  if (!result.ok) throw new Error(payload.error || 'Pembayaran Pi belum dapat diproses.');
}

export async function resolveIncompletePiPayment(payment: PiPayment, onProgress?: ProgressCallback) {
  const paymentId = payment.identifier;
  const trackId = payment.metadata?.trackId;
  if (!paymentId || !trackId || payment.status?.cancelled || payment.status?.user_cancelled || payment.status?.developer_completed) return false;

  onProgress?.('Menyelesaikan pembayaran Pi sebelumnya…');
  if (!payment.status?.developer_approved) {
    await postPayment('/api/pi-payment-approve', { paymentId, trackId });
  }

  const txid = payment.transaction?.txid;
  if (txid) {
    await postPayment('/api/pi-payment-complete', { paymentId, txid, trackId });
    onProgress?.('Pembayaran Pi sebelumnya berhasil diselesaikan.');
  } else {
    onProgress?.('Pembayaran sebelumnya dipulihkan. Silakan selesaikan di Pi Wallet.');
  }
  return true;
}

export { postPayment };
