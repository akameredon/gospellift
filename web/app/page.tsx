'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Submission = { id: string; artist_name: string; song_title: string; genre: string; status: string; created_at: string; audio_object_path: string | null };
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
const genres = ['Contemporary Gospel','Worship','Praise','Traditional Gospel','Afrogospel','Inspirational','Choir','Other'];

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [authMode, setAuthMode] = useState<'signin'|'signup'|'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) { setSubmissions([]); return; }
    supabase.from('artist_submissions').select('id,artist_name,song_title,genre,status,created_at,audio_object_path').order('created_at', { ascending: false })
      .then(({ data, error }) => { if (error) setNotice(error.message); else setSubmissions((data || []) as Submission[]); });
  }, [session?.user?.id]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice('');
    if (!supabase) { setNotice('The secure backend is not configured yet. Add the GospelLift environment variables to run this app.'); return; }
    setBusy(true);
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` } });
        if (error) throw error;
        if (data.session) setSession(data.session);
        else setNotice('Check your email to confirm your account, then return here to sign in.');
      } else if (authMode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/update-password` });
        if (error) throw error;
        setNotice('If an account exists for that address, a password-reset email has been sent.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSession(data.session);
      }
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }

  async function handleSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice('');
    if (!supabase || !session?.user) { setNotice('Please sign in first.'); return; }
    const form = event.currentTarget;
    const values = new FormData(form);
    const rights = values.get('rights') === 'on';
    const consent = values.get('consent') === 'on';
    if (!rights || !consent) { setNotice('Please confirm your rights to submit the music and consent to processing.'); return; }
    const file = values.get('audio') as File | null;
    if (file && file.size > 50 * 1024 * 1024) { setNotice('Audio files must be 50 MB or smaller.'); return; }
    if (file && file.size && !file.type.startsWith('audio/')) { setNotice('Please choose an audio file.'); return; }
    setBusy(true);
    try {
      const submissionId = crypto.randomUUID();
      let audioPath: string | null = null;
      if (file && file.size > 0) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120) || 'track.mp3';
        audioPath = `${session.user.id}/${submissionId}/${safeName}`;
        const { error: uploadError } = await supabase.storage.from('artist-audio').upload(audioPath, file, { upsert: false, contentType: file.type || 'application/octet-stream' });
        if (uploadError) throw uploadError;
      }
      const row = {
        id: submissionId, artist_id: session.user.id,
        artist_name: String(values.get('artistName') || '').trim(),
        song_title: String(values.get('songTitle') || '').trim(),
        genre: String(values.get('genre') || ''),
        release_status: String(values.get('releaseStatus') || 'Not sure yet'),
        goal: String(values.get('goal') || '').trim(),
        song_story: String(values.get('story') || '').trim(),
        artist_background: String(values.get('background') || '').trim(),
        music_link: String(values.get('musicLink') || '').trim(),
        audio_object_path: audioPath, rights_confirmed: rights, consent_to_process: consent,
        status: 'submitted', submitted_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('artist_submissions').insert(row);
      if (error) {
        if (audioPath) await supabase.storage.from('artist-audio').remove([audioPath]);
        throw error;
      }
      const { data, error: listError } = await supabase.from('artist_submissions').select('id,artist_name,song_title,genre,status,created_at,audio_object_path').order('created_at', { ascending: false });
      if (listError) throw listError;
      setSubmissions((data || []) as Submission[]); form.reset();
      setNotice('Your submission has been received securely. GospelLift will review it and follow up by email.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not submit your music. Please try again.'); }
    finally { setBusy(false); }
  }

  async function signOut() { if (supabase) await supabase.auth.signOut(); setSession(null); setSubmissions([]); setNotice('You have signed out.'); }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#home"><span className="brand-mark">G</span><span>GospelLift<small>YOUR MUSIC. MOVING FORWARD.</small></span></a><a className="top-link" href="https://akameredon.github.io/gospellift/">Explore GospelLift ↗</a></header>
    <section className="hero" id="home"><div className="hero-copy"><p className="eyebrow">A HOME FOR GOSPEL VOICES</p><h1>Your message deserves<br/><em>to be heard.</em></h1><p className="intro">Submit your music, tell us the story behind it, and take the next step toward reaching more listeners.</p><div className="hero-points"><span>01&nbsp; Artist-first</span><span>02&nbsp; Private submissions</span><span>03&nbsp; Clear next steps</span></div></div><div className="hero-art" aria-label="Decorative soundwave illustration"><div className="sun"></div><div className="wave wave-one"></div><div className="wave wave-two"></div><div className="wave wave-three"></div><div className="note">♪</div><div className="art-caption">YOUR SONG<br/>CAN TRAVEL FAR</div></div></section>
    {!supabase && <div className="notice warning">The app is built, but backend environment variables are not set on this deployment yet. No account or audio data will be saved until the dedicated GospelLift Supabase URL and publishable key are configured.</div>}
    {notice && <div className="notice" role="status">{notice}</div>}
    {loading ? <section className="panel"><p>Loading your secure workspace…</p></section> : !session ? <section className="workspace"><div className="section-heading"><p className="eyebrow">ARTIST WORKSPACE</p><h2>{authMode === 'signup' ? 'Create your artist account' : authMode === 'reset' ? 'Reset your password' : 'Welcome back'}</h2><p>{authMode === 'signup' ? 'Your own private space to submit and track your music.' : authMode === 'reset' ? 'We’ll email you a secure link to choose a new password.' : 'Sign in to manage your music submissions.'}</p></div><form className="form-card auth-form" onSubmit={handleAuth}>{authMode === 'signup' && <label>Artist or display name<input required value={displayName} onChange={e=>setDisplayName(e.target.value)} autoComplete="name" placeholder="Your artist name" maxLength={100}/></label>}<label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com"/></label>{authMode !== 'reset' && <label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} placeholder="At least 8 characters"/></label>}<button className="button primary full" disabled={busy}>{busy ? 'Please wait…' : authMode === 'signup' ? 'Create account' : authMode === 'reset' ? 'Send reset link' : 'Sign in'}</button><div className="form-links">{authMode !== 'signin' && <button type="button" onClick={()=>{setAuthMode('signin');setNotice('');}}>Back to sign in</button>}{authMode === 'signin' && <><button type="button" onClick={()=>setAuthMode('reset')}>Forgot password?</button><button type="button" onClick={()=>setAuthMode('signup')}>Create artist account</button></>}</div><p className="fineprint">By submitting music, you confirm you have permission to share it and agree that GospelLift may process it to assess and support your campaign.</p></form></section> : <section className="workspace"><div className="dashboard-head"><div><p className="eyebrow">YOUR PRIVATE WORKSPACE</p><h2>Welcome{session.user.user_metadata?.display_name ? `, ${session.user.user_metadata.display_name}` : ''}.</h2><p>Your music stays attached to your account. Only submit tracks you have the right to share.</p></div><button className="button secondary" onClick={signOut}>Sign out</button></div><div className="dashboard-grid"><form className="form-card submission-form" onSubmit={handleSubmission}><h3>Submit a song</h3><p className="muted">Tell us a little about your music. Fields marked * are required.</p><div className="fields"><label>Artist name *<input name="artistName" required maxLength={120} placeholder="Artist / ministry name"/></label><label>Song title *<input name="songTitle" required maxLength={180} placeholder="Title of your track"/></label><label>Genre *<select name="genre" required defaultValue=""><option value="" disabled>Select genre</option>{genres.map(g=><option key={g}>{g}</option>)}</select></label><label>Release status<select name="releaseStatus" defaultValue="Not sure yet"><option>Not released yet</option><option>Already released</option><option>Upcoming release</option><option>Not sure yet</option></select></label><label className="wide">What would you like help with?<textarea name="goal" rows={2} maxLength={1500} placeholder="More listeners, release planning, content, distribution guidance…"/></label><label className="wide">The story behind the song<textarea name="story" rows={3} maxLength={4000} placeholder="What inspired it? What should listeners feel or remember?"/></label><label className="wide">A little about you / your ministry<textarea name="background" rows={2} maxLength={2500} placeholder="Your journey, church or ministry, and audience…"/></label><label className="wide">Existing music link (optional)<input name="musicLink" type="url" placeholder="https://…"/></label><label className="wide upload-field">Audio file (optional, up to 50 MB)<input name="audio" type="file" accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/aac,audio/flac,audio/ogg,audio/webm"/><small>MP3 or WAV recommended. Your file is stored in a private bucket, not a public link.</small></label></div><label className="check"><input type="checkbox" name="rights" required/> I own this music or have permission to submit it.</label><label className="check"><input type="checkbox" name="consent" required/> I consent to GospelLift processing this submission to review and support my campaign.</label><button className="button primary full" disabled={busy}>{busy ? 'Submitting securely…' : 'Submit song for review'}</button></form><aside className="form-card list-card"><div className="list-title"><h3>Your submissions</h3><span className="count">{submissions.length}</span></div>{submissions.length === 0 ? <div className="empty-state"><span>♫</span><p>No submissions yet.</p><small>Once you submit a song, its status will appear here.</small></div> : <div className="submission-list">{submissions.map(s=><article className="submission-item" key={s.id}><div className="track-icon">♫</div><div className="track-details"><strong>{s.song_title || 'Untitled song'}</strong><span>{s.artist_name} · {s.genre || 'Genre not set'}</span><small>{new Date(s.created_at).toLocaleDateString()}</small></div><span className={`status status-${s.status}`}>{s.status.replace('_',' ')}</span></article>)}</div>}<div className="help-box"><strong>What happens next?</strong><p>We review your submission and contact you with next steps. Any paid service or extra expense must be discussed and approved separately before you commit.</p></div></aside></div></section>}
    <footer><span>© {new Date().getFullYear()} GospelLift</span><span><a href="https://akameredon.github.io/gospellift/privacy.html">Privacy</a><a href="https://akameredon.github.io/gospellift/terms.html">Terms</a></span><p>GospelLift is an independent artist-support initiative. Submission does not guarantee promotion, placement, or audience growth.</p></footer>
  </main>;
}
