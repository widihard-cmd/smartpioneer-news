const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const encoder = new TextEncoder();

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, ...extraHeaders } });
}

function base64url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}

export async function onRequestPost({ request, env }) {
  if (!env.PI_SESSION_SECRET) return json({ error: 'Sesi Pi belum dikonfigurasi.' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Format permintaan tidak valid.' }, 400); }
  if (typeof body?.accessToken !== 'string' || body.accessToken.length < 20) return json({ error: 'Token Pi tidak valid.' }, 400);

  try {
    const piResponse = await fetch('https://api.minepi.com/v2/me', { headers: { Authorization: `Bearer ${body.accessToken}` } });
    if (!piResponse.ok) return json({ error: 'Token Pi tidak dapat diverifikasi.' }, 401);
    const piUser = await piResponse.json();
    if (typeof piUser?.uid !== 'string' || typeof piUser?.username !== 'string') return json({ error: 'Respons akun Pi tidak lengkap.' }, 401);

    const value = base64url(encoder.encode(JSON.stringify({ uid: piUser.uid, username: piUser.username, exp: Date.now() + 604800000, nonce: crypto.randomUUID() })));
    const cookie = `pi_session=${value}.${await sign(value, env.PI_SESSION_SECRET)}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`;
    return json({ user: { uid: piUser.uid, username: piUser.username } }, 200, { 'Set-Cookie': cookie });
  } catch {
    return json({ error: 'Layanan Pi sementara tidak dapat dijangkau.' }, 502);
  }
}
