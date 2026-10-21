'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = url && key ? createClient(url, key) : null;
export default function UpdatePassword() {
  const [password,setPassword] = useState(''); const [notice,setNotice] = useState(''); const [busy,setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setNotice(''); if (!supabase) { setNotice('GospelLift backend configuration is missing.'); setBusy(false); return; } const {error} = await supabase.auth.updateUser({password}); setNotice(error ? error.message : 'Password updated. You can now return to your workspace and sign in.'); setBusy(false); }
  return <main className="shell narrow"><a className="brand" href="/"><span className="brand-mark">G</span><span>GospelLift<small>SECURE ACCOUNT RECOVERY</small></span></a><section className="form-card recovery"><p className="eyebrow">ACCOUNT SECURITY</p><h1>Choose a new password</h1><p>Open this page from the secure password-reset email you requested.</p><form onSubmit={submit}><label>New password<input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label><button className="button primary full" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button></form>{notice && <p className="notice" role="status">{notice}</p>}<a className="back-link" href="/">← Back to GospelLift</a></section></main>;
}
