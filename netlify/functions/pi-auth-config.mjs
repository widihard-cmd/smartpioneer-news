export default async () => new Response(JSON.stringify({ sandbox: process.env.PI_SANDBOX !== 'false' }), {
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});
