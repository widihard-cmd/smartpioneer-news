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
    fetch(`${SUPABASE_URL}/rest/v1/guestbook_messages?select=id,display_name,message,created_at&is_approved=eq.true&order=created_at.desc&limit=6`, {
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
      setName(''); setMessage(''); setStatus('Pesan terkirim. Setelah disetujui, pesan akan tampil untuk Pioneer lainnya.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Pesan belum dapat dikirim.');
    } finally { setSending(false); }
  }

  return <section id="pesan-pioneer" className="mx-auto max-w-screen-xl px-5 py-20"><div className="grid gap-7 lg:grid-cols-[.82fr_1.18fr]">
    <div className="rounded-[2rem] border border-gold-500/25 bg-[linear-gradient(145deg,rgba(88,44,172,.42),rgba(15,6,34,.88))] p-7 sm:p-9"><p className="section-kicker">Pesan untuk Pioneer</p><h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-white">Sapa komunitas. Tinggalkan jejak baik.</h2><p className="mt-5 max-w-md leading-7 text-white/60">Kirim semangat, ide, atau salam untuk Pioneer Indonesia. Semua pesan dibaca terlebih dahulu agar ruang ini tetap hangat dan aman.</p>
      <form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-semibold text-white/80">Nama panggilan<input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder="Contoh: Widi, Pioneer Jakarta" className="mt-2 w-full rounded-xl border border-white/12 bg-[#0d0520]/65 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-gold-500/60" /></label><label className="block text-sm font-semibold text-white/80">Pesan<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={300} rows={4} placeholder="Tulis pesan baikmu untuk komunitas…" className="mt-2 w-full resize-none rounded-xl border border-white/12 bg-[#0d0520]/65 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-gold-500/60" /></label><div className="flex items-center justify-between gap-3"><span className="text-xs text-white/40">{message.length}/300</span><button type="submit" disabled={sending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">{sending ? 'Mengirim…' : 'Kirim pesan'} <span>→</span></button></div>{status && <p className="text-sm leading-6 text-gold-200">{status}</p>}</form>
    </div>
    <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7 sm:p-9"><div className="flex items-end justify-between gap-4"><div><p className="section-kicker">Suara komunitas</p><h2 className="mt-3 text-3xl font-bold text-white">Pesan Pioneer terbaru.</h2></div><span className="text-2xl text-gold-300">✦</span></div><div className="mt-7 space-y-4">{messages.length ? messages.map((item) => <article key={item.id} className="rounded-2xl border border-white/8 bg-[#100625]/55 p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-gold-200">{item.display_name}</h3><time className="text-xs text-white/40">{relativeDate(item.created_at)}</time></div><p className="mt-3 leading-7 text-white/70">{item.message}</p></article>) : <div className="flex min-h-56 items-center rounded-2xl border border-dashed border-white/15 px-7 text-center text-sm leading-7 text-white/45">Belum ada pesan yang disetujui. Jadilah Pioneer pertama yang meninggalkan salam baik di sini.</div>}</div></div>
  </div></section>;
}
