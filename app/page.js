'use client';

import { useState, useEffect, useRef } from 'react';

// Simple Hermes-like dashboard with inline CSS only
const PILLARS = [
  { icon: '📡', label: 'STORM SNIPERS',   value: 'SCANNING',     status: 'warn' },
  { icon: '📧', label: 'EMAIL API',        value: 'PROPAGATING',  status: 'warn' },
  { icon: '⛓️', label: 'SOLANA LINK',     value: 'SYNCED',       status: 'ok'   },
  { icon: '🧠', label: 'NEURAL ENGINE',   value: 'ACTIVE',       status: 'ok'   },
  { icon: '💰', label: 'CRM PIPELINE',    value: 'LIVE',         status: 'ok'   },
];

const getTimestamp = () => new Date().toISOString().replace('T',' ').substring(11,23);

export default function PredictiveDashboard() {
  // Core state
  const [status, setStatus] = useState('SYSTEMS ONLINE');
  const [command, setCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isForging, setIsForging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [revenue, setRevenue] = useState(0);
  const [uptime, setUptime] = useState('0s');
  const [log, setLog] = useState([
    { id: 0, time: 'BOOT', message: 'Predictive cloud initialized', type: 'ok' },
  ]);

  const bootTime = useRef(Date.now());
  const logId = useRef(1);
  const recognitionRef = useRef(null);

  // Uptime ticker
  useEffect(() => {
    const iv = setInterval(() => {
      const ms = Date.now() - bootTime.current;
      const s = Math.floor(ms/1000);
      if (s < 60) setUptime(`${s}s`);
      else {
        const m = Math.floor(s/60);
        const sec = s % 60;
        setUptime(`${m}m ${sec}s`);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // Log helper
  const appendLog = (message, type='info') => {
    setLog(prev => {
      const entry = { id: logId.current++, time: getTimestamp(), message, type };
      const next = [entry, ...prev];
      return next.length > 15 ? next.slice(0,15) : next;
    });
  };

  // Execute command (mock Hermes)
  const handleExecute = async () => {
    const raw = command.trim();
    if (!raw || isRunning) return;
    setIsRunning(true);
    setStatus('PROCESSING DIRECTIVE...');
    appendLog(`Command: "${raw}"`);

    try {
      const res = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: raw, provider: 'gemini' }),
      });
      if (!res.ok) throw new Error('Hermes connection failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      setStatus('');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStatus(acc.toUpperCase());
      }
      appendLog('Hermes responded', 'ok');
      setCommand('');
      setRevenue(r => r + Math.random() * 100);
    } catch (err) {
      setStatus('CONNECTION LOST — REROUTING...');
      appendLog(err.message, 'warn');
    } finally {
      setIsRunning(false);
    }
  };

  // Voice input (optional)
  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      appendLog('Voice input not supported in this browser', 'warn');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => { setIsListening(true); appendLog('Voice input active','ok'); };
    rec.onend = () => { setIsListening(false); };
    rec.onerror = () => { setIsListening(false); appendLog('Voice input error','warn'); };
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setCommand(t);
      appendLog(`Voice captured: "${t}"`, 'ok');
    };
    recognitionRef.current = rec;
    rec.start();
  };

  // Forge (multi-agent)
  const handleForge = async () => {
    if (isForging) return;
    setIsForging(true);
    setStatus('INITIALIZING MULTI-AGENT FORGE...');
    appendLog('Multi-agent forge triggered');
    const steps = [
      'STORM SNIPER AGENTS DEPLOYED...',
      'EMAIL SEQUENCE ARMED...',
      'SOLANA WALLET SYNCING...',
      'NEURAL TARGETING ACTIVE...',
      'PREDICTIVE REVENUE ENGINE ONLINE...',
      'FORGE COMPLETE — ALL AGENTS RUNNING',
    ];
    for (let i=0;i<steps.length;i++) {
      await new Promise(r => setTimeout(r, 700));
      setStatus(steps[i]);
      appendLog(steps[i], i===steps.length-1?'ok':'info');
    }
    setRevenue(r => r + Math.random()*500);
    setIsForging(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) handleExecute();
  };

  // Local placeholder Pillars/index strings used for display
  return (
    <main style={{ fontFamily: 'monospace', backgroundColor: '#000', color: '#39ff14', minHeight: '100vh', padding: 20 }}>
      <section style={{ border: '1px solid rgba(0,245,255,.28)', borderRadius: 8, padding: 12, maxWidth: 1000, margin: '0 auto', background: '#040d0d' }}>
        <header style={{ borderBottom: '1px solid rgba(0,245,255,.4)', padding: '6px 0', textAlign: 'center' }}>
          <div style={{ color: '#39ff14', fontWeight: 900, letterSpacing: 3, fontSize: 14 }}>EMPIRE AI</div>
          <div style={{ color: '#00f5ff', fontSize: 12 }}>PREDICTIVE CLOUD ACTIVE</div>
        </header>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1, border: '1px solid #2d2d2d', padding: 12, borderRadius: 6, background: '#0a0a0a' }}>
            <div style={{ fontSize: 12, color: '#8bd' }}>COMMAND</div>
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command here..."
              rows={6}
              style={{ width: '100%', background: 'transparent', color: '#39ff14', border: 'none', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button onClick={handleExecute} disabled={isRunning || !command.trim()} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #2d2d2d', background: '#1b1b1b', color: '#39ff14', cursor: 'pointer' }}>
                {isRunning ? 'RUNNING...' : 'EXECUTE'}
              </button>
              <button onClick={handleVoice} style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #2d2d2d', background: '#1b1b1b', color: '#39ff14', cursor: 'pointer' }}>
                🎤 Voice
              </button>
            </div>
          </div>
          <aside style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ padding: 8, border: '1px solid #2d2d2d', borderRadius: 6, background: '#0a0a0a' }}>
              <div style={{ fontSize: 10, color: '#8bd' }}>PILLAR STATUS</div>
              {PILLARS.map((p) => (
                <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                  <span>{p.icon} {p.label}</span>
                  <span style={{ color: p.status === 'ok' ? '#39ff14' : '#ffb400' }}>{p.value}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 8, border: '1px solid #2d2d2d', borderRadius: 6, background: '#0a0a0a' }}>
              <div style={{ fontSize: 12, color: '#8bd' }}>REVENUE</div>
              <div style={{ fontSize: 20, color: '#39ff14', fontWeight: 700 }}>${revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <div style={{ fontSize: 10, color: '#8bd' }}>BUILD v2.1.0</div>
            </div>
          </aside>
        </div>
        <footer style={{ textAlign: 'center', fontSize: 10, color: '#8bd', marginTop: 12 }}>NODE EMP-01 • PRODUCTION • BUILD v2.1.0</footer>
      </section>
    </main>
  );
}
