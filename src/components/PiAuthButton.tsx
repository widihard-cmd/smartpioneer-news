import { useCallback, useEffect, useState } from 'react';

type AuthConfig = { sandbox: boolean };
type SignedInUser = { uid: string; username: string };

export default function PiAuthButton() {
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'unavailable'>('idle');

  const signIn = useCallback(async () => {
    if (!window.Pi) {
      setState('unavailable');
      return;
    }

    setState('loading');
    try {
      const configResponse = await fetch('/api/pi-auth-config', { cache: 'no-store' });
      const config = configResponse.ok ? await configResponse.json() as AuthConfig : { sandbox: true };

      await window.Pi.init({ version: '2.0', sandbox: config.sandbox });
      const auth = await window.Pi.authenticate(['username'], () => undefined);
      const verifyResponse = await fetch('/api/pi-auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken }),
      });
      const verified = await verifyResponse.json() as { user?: SignedInUser; error?: string };
      if (!verifyResponse.ok || !verified.user) throw new Error(verified.error || 'Verifikasi akun Pi gagal.');

      setUser(verified.user);
      window.dispatchEvent(new CustomEvent('pioneer:pi-authenticated', { detail: verified.user }));
    } catch {
      setState('idle');
      return;
    }
    setState('idle');
  }, []);

  useEffect(() => {
    void signIn();
  }, [signIn]);

  if (user) return <span className="hidden rounded-full border border-gold-500/30 px-3 py-1.5 text-xs font-semibold text-gold-200 sm:inline">π {user.username}</span>;

  return (
    <button
      type="button"
      onClick={() => void signIn()}
      disabled={state === 'loading'}
      className="rounded-full border border-gold-500/45 px-3 py-1.5 text-xs font-semibold text-gold-300 transition hover:bg-gold-500 hover:text-pi-950 disabled:cursor-wait disabled:opacity-60"
      title={state === 'unavailable' ? 'Buka melalui Pi Browser untuk masuk' : 'Masuk dengan Pi'}
    >
      {state === 'loading' ? 'Menghubungkan…' : state === 'unavailable' ? 'Buka di Pi Browser' : 'Masuk dengan Pi'}
    </button>
  );
}
