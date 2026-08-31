import { createHmac, randomBytes } from 'node:crypto';

const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const sessionSecret = process.env.PI_SESSION_SECRET;

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, ...extraHeaders } });
}

function sign(value) {
  return createHmac('sha256', sessionSecret).update(value).digest('base64url');
}

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method tidak diizinkan.' }, 405);
  if (!sessionSecret) return json({ error: 'Sesi Pi belum dikonfigurasi.' }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Format permintaan tidak valid.' }, 400); }
  if (typeof body?.accessToken !== 'string' || body.accessToken.length < 20) return json({ error: 'Token Pi tidak valid.' }, 400);

  try {
    const piResponse = await fetch('https://api.minepi.com/v2/me', { headers: { Authorization: `Bearer ${body.accessToken}` } });
    if (!piResponse.ok) return json({ error: 'Token Pi tidak dapat diverifikasi.' }, 401);
    const piUser = await piResponse.json();
    if (typeof piUser?.uid !== 'string' || typeof piUser?.username !== 'string') return json({ error: 'Respons akun Pi tidak lengkap.' }, 401);

    const payload = Buffer.from(JSON.stringify({ uid: piUser.uid, username: piUser.username, exp: Date.now() + 7 * 24 * 60 * 60 * 1000, nonce: randomBytes(12).toString('base64url') })).toString('base64url');
    const cookie = `pi_session=${payload}.${sign(payload)}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`;
    return json({ user: { uid: piUser.uid, username: piUser.username } }, 200, { 'Set-Cookie': cookie });
  } catch {
    return json({ error: 'Layanan Pi sementara tidak dapat dijangkau.' }, 502);
  }
};
