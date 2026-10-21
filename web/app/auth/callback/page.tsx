'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = url && key ? createClient(url, key, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
}) : null;

export default function AuthCallback() {
  const [message, setMessage] = useState('Confirming your email securely…');

  useEffect(() => {
    let active = true;

    async function completeAuth() {
      if (!supabase) {
        setMessage('GospelLift authentication is not configured. Please contact support.');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const authError = params.get('error_description') || params.get('error');

      if (authError) {
        setMessage(`The confirmation link could not be used: ${authError}. Please return to GospelLift and request a new link.`);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        if (error) {
          setMessage('This confirmation link may have expired or already been used. Return to GospelLift and sign in, or request a fresh confirmation email.');
          return;
        }
        window.location.replace('/');
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        setMessage('We could not verify the confirmation link. Please return to GospelLift and request a new one.');
      } else if (data.session) {
        window.location.replace('/');
      } else {
        setMessage('The confirmation link is missing its verification code or has expired. Return to GospelLift and request a new confirmation email.');
      }
    }

    void completeAuth();
    return () => { active = false; };
  }, []);

  return (
    <main className="shell narrow">
      <section className="form-card recovery">
        <p className="eyebrow">GOSPELLIFT ACCOUNT</p>
        <h1>Verifying your email</h1>
        <p role="status">{message}</p>
        <a className="button primary" href="/">Continue to GospelLift</a>
      </section>
    </main>
  );
}
