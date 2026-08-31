export async function onRequestGet({ env }) {
  return new Response(JSON.stringify({ sandbox: env.PI_SANDBOX !== 'false' }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
