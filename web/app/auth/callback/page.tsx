'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = url && key ? createClient(url,key,{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}}) : null;
export default function AuthCallback() { const [message,setMessage] = useState('Confirming your secure sign-in…'); useEffect(()=>{ if (!supabase) {setMessage('GospelLift backend configuration is missing.');return;} supabase.auth.getSession().then(({data,error})=>{ if(error) setMessage('We could not confirm the link. Please return to GospelLift and try signing in again.'); else if(data.session) window.location.replace('/'); else setMessage('If you just confirmed your email, return to GospelLift and sign in. If the link has expired, request a new one.'); }); },[]); return <main className="shell narrow"><section className="form-card recovery"><p className="eyebrow">GOSPELLIFT ACCOUNT</p><h1>Verifying your link</h1><p>{message}</p><a className="button primary" href="/">Continue to GospelLift</a></section></main>; }
