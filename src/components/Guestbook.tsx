import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

type GuestbookMessage = { id: number; display_name: string; message: string; created_at: string };

function relativeDate(value: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  return `${days} hari lalu`;
}

export default function Guestbook() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return;
    fetch(`${SUPABASE_URL}/rest/v1/guestbook_messages?select=id,display_name,message,created_at&is_approved=eq.true&order=created_at.desc&limit=4`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    }).then((response) => response.ok ? response.json() : []).then(setMessages).catch(() => setMessages([]));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!SUPABASE_URL || !SUPABASE_KEY) { setStatus('Ruang pesan sedang disiapkan. Silakan coba kembali sebentar lagi.'); return; }
    if (name.trim().length < 2 || message.trim().length < 4) { setStatus('Tulis nama dan pesan singkat terlebih dahulu ya.'); return; }
    setSending(true); setStatus('');
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/guestbook_messages`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ display_name: name.trim(), message: message.trim() }),
      });
      if (!response.ok) throw new Error('Pesan belum dapat dikirim.');
      setName(''); setMessage(''); setStatus('Pesan terkirim dan langsung tampil untuk Pioneer lainnya.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Pesan belum dapat dikirim.');
    } finally { setSending(false); }
  }

  return <section id="pesan-pioneer" className="mx-auto max-w-screen-xl px-5 py-12 sm:py-16"><div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
    <div className="rounded-3xl border border-gold-500/25 bg-[linear-gradient(145deg,rgba(88,44,172,.42),rgba(15,6,34,.88))] p-6 sm:p-7"><p className="section-kicker">Pesan untuk Pioneer</p><h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-white">Sapa komunitas.</h2><p className="mt-3 max-w-md text-sm leading-6 text-white/60">Kirim semangat, ide, atau salam baik untuk Pioneer Indonesia.</p>
      <form onSubmit={submit} className="mt-5 space-y-3"><label className="block text-xs font-semibold text-white/80">Nama panggilan<input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder="Contoh: Widi, Pioneer Jakarta" className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#0d0520]/65 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-gold-500/60" /></label><label className="block text-xs font-semibold text-white/80">Pesan<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={300} rows={3} placeholder="Tulis pesan baikmu untuk komunitas…" className="mt-1.5 w-full resize-none rounded-xl border border-white/12 bg-[#0d0520]/65 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-gold-500/60" /></label><div className="flex items-center justify-between gap-3"><span className="text-xs text-white/40">{message.length}/300</span><button type="submit" disabled={sending} className="btn-primary !px-4 !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50">{sending ? 'Mengirim…' : 'Kirim pesan'} <span>→</span></button></div>{status && <p className="text-xs leading-5 text-gold-200">{status}</p>}</form>
    </div>
    <div className="rounded-3xl border border-white/10 bg-white/[.035] p-6 sm:p-7"><div className="flex items-end justify-between gap-4"><div><p className="section-kicker">Suara komunitas</p><h2 className="mt-2 text-2xl font-bold text-white">Pesan Pioneer terbaru.</h2></div><span className="text-xl text-gold-300">✦</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{messages.length ? messages.map((item) => <article key={item.id} className="rounded-xl border border-white/8 bg-[#100625]/55 p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-gold-200">{item.display_name}</h3><time className="text-[11px] text-white/40">{relativeDate(item.created_at)}</time></div><p className="mt-2 text-sm leading-6 text-white/70">{item.message}</p></article>) : <div className="flex min-h-40 items-center rounded-xl border border-dashed border-white/15 px-6 text-center text-sm leading-6 text-white/45 sm:col-span-2">Jadilah Pioneer pertama yang meninggalkan salam baik di sini.</div>}</div></div>
  </div></section>;
}
