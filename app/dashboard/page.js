'use client';

import { useState, useCallback } from 'react';

// Lightweight live API hook for posting to API endpoints under /api
function useLiveApi(baseUrl = '/api') {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const post = useCallback(async (path, payload) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(baseUrl + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Request failed');
      }
      setData(json);
      return json;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  return { loading, data, error, post };
}

export default function PredictiveDashboard() {
  const { loading, data, error, post } = useLiveApi('/api');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Empire AI — Systems Online');
  const [text, setText] = useState('This is a live onboarding message to your Empire AI dashboard.');

  const sendTest = async () => {
    if (!email) return;
    try {
      await post('/send', { email, subject, text });
    } catch (e) {
      // error handled by hook
    }
  };

  const onboard = async () => {
    if (!email) return;
    try {
      await post('/email', { email, name: 'Operator' });
    } catch (e) {
      // error handled by hook
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <section style={{ maxWidth: 800, margin: '0 auto', border: '1px solid #2d2d2d', borderRadius: 8, padding: 16, background: '#0b0b0b' }}>
        <h2 style={{ color: '#39ff14', margin: 0, fontSize: 20, fontWeight: 900 }}>Empire AI Live Dashboard</h2>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, color: '#8bd' }}>Recipient Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@example.com"
              style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid #2d2d2d', background: '#111', color: '#39ff14' }}
            />
            <label style={{ fontSize: 12, color: '#8bd' }}>Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid #2d2d2d', background: '#111', color: '#39ff14' }}
            />
            <label style={{ fontSize: 12, color: '#8bd' }}>Message</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid #2d2d2d', background: '#111', color: '#39ff14' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={sendTest} disabled={loading || !email} style={{ padding: '8px 12px', borderRadius: 4, background: '#39ff14', color: '#000', fontWeight: 700, border: 'none' }}>
                {loading ? 'SENDING...' : 'SEND TEST EMAIL'}
              </button>
              <button onClick={onboard} disabled={loading || !email} style={{ padding: '8px 12px', borderRadius: 4, background: '#00f5ff', color: '#000', fontWeight: 700, border: 'none' }}>
                ONBOARD USER
              </button>
            </div>
            {error && <div style={{ color: '#ffb400' }}>Error: {error}</div>}
            {data && <pre style={{ marginTop: 8, background: '#111', padding: 8, borderRadius: 4 }}>{JSON.stringify(data, null, 2)}</pre>}
          </div>
        </div>
      </section>
    </div>
  );
}
