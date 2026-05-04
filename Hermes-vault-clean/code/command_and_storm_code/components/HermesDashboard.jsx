"use client";

import { useState, useEffect, useRef } from 'react';

// Development mock flag (exposed to client via NEXT_PUBLIC_DEV_MOCK)
const MOCK_DEV = (typeof process !== 'undefined') && (process.env.NEXT_PUBLIC_DEV_MOCK === 'true');

// Basic health/diagnostic tiles
const DIAGNOSTICS = [
  { label: "SOLANA NETWORK", value: "CONNECTED", status: "ok" },
  { label: "HARDWARE PODS",  value: "ONLINE",    status: "ok" },
  { label: "NEURAL ENGINE",  value: "ACTIVE",    status: "ok" },
  { label: "CRM PIPELINE",   value: "LIVE",      status: "ok" },
];

const getTimestamp = () => new Date().toISOString().replace("T", " ").substring(11, 23);

export default function HermesDashboard() {
  const [status, setStatus] = useState("PREDICTIVE CLOUD ACTIVE");
  const [isRunning, setIsRunning] = useState(false);
  const [uptime, setUptime] = useState("0s");
  const [log, setLog] = useState([
    { id: 0, time: "BOOT", message: "Empire AI systems nominal", type: "ok" },
  ]);
  const [textInput, setTextInput] = useState('');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('Hermes is standing by. Send a command.');
  const [videoUrl, setVideoUrl] = useState('');
  const listeningRef = useRef(null);
  const bootTime = useRef(Date.now());
  const logId = useRef(1);
  const timer = useRef(null);

  // Voice: start/stop listening
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support the Web Speech API. Please use Chrome.');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => {
      setResponse('Listening to your voice...');
    };
    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setResponse('Error catching voice. Try typing instead.');
    };
    recognition.onend = () => {
      if (transcript) {
        sendCommandToBrain(transcript);
        setTranscript('');
      }
    };
    recognition.start();
    listeningRef.current = recognition;
  };

  const stopListening = () => {
    if (listeningRef.current) {
      listeningRef.current.stop();
      listeningRef.current = null;
    }
  };

  // Uptime ticker
  useEffect(() => {
    if (isRunning) {
      timer.current = setInterval(() => {
        const elapsed = Date.now() - bootTime.current;
        setUptime(formatUptime(elapsed));
      }, 1000);
    } else {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [isRunning]);

  const formatUptime = (ms) => {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m < 60 ? `${m}m ${r}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  const addLog = (message, type = 'ok') => {
    const t = getTimestamp();
    setLog((l) => [...l, { id: logId.current++, time: t, message, type }]);
  };

  const startBuild = () => {
    if (isRunning) return;
    bootTime.current = Date.now();
    setUptime('0s');
    setStatus('PREDICTIVE CLOUD ACTIVE');
    setIsRunning(true);
    addLog('Boot sequence initiated', 'ok');
    // simulate video generation after a moment
    setTimeout(() => {
      const url = 'https://www.w3schools.com/html/mov_bbb.mp4';
      setVideoUrl(url);
      addLog('Cinematic video generated', 'ok');
      setIsRunning(false);
    }, 4000);
  };

  const stopBuild = () => {
    if (!isRunning) return;
    setIsRunning(false);
    addLog('Build sequence halted by user', 'warn');
  };

  // Command flow
  const sendCommandToBrain = async (command) => {
    // If in mock/dev mode, bypass API and simulate a response for Hermes
    if (MOCK_DEV) {
      const simulated = `Mock response: Command received: ${command}`;
      setResponse(simulated);
      addLog(`Mock Hermes CMD: ${command} => ${simulated}`, 'ok');
      return;
    }
    setResponse('Transmitting command to the server...');
    try {
      const res = await fetch('/api/hermes/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (res.ok) {
        const data = await res.json();
        setResponse(data?.response ?? 'Command acknowledged');
        addLog(`Cmd: ${command} => ${data?.response ?? 'OK'}`, 'ok');
      } else {
        setResponse(`Server error: ${res.statusText}`);
        addLog(`Cmd: ${command} => ${res.statusText}`, 'warn');
      }
    } catch (e) {
      setResponse(`Error: ${e.message}`);
      addLog(`Cmd: ${command} => error: ${e.message}`, 'warn');
    }
  };

  const handleTextSubmit = (e) => {
    e?.preventDefault();
    if (!textInput.trim()) return;
    sendCommandToBrain(textInput.trim());
    setTextInput('');
  };

  // initial mount log
  useEffect(() => {
    addLog('Hermes dashboard mounted', 'ok');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 12, borderRadius: 8, border: '1px solid #2a2a2a', background: '#111' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #0ff', color: '#0ff', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>Voice Builder</span>
        <span style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid #333', color: '#fff', background: '#222' }}>{status}</span>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {DIAGNOSTICS.map((d, idx) => (
          <div key={idx} style={{ padding: 12, borderRadius: 8, border: '1px solid #2a2a2a', background: d.status === 'ok' ? '#111' : '#2b1a0a' }}>
            <div style={{ fontSize: 12, color: '#aaa', textTransform: 'uppercase' }}>{d.label}</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: d.status === 'ok' ? '#39ff14' : '#ffb400' }}>{d.value}</div>
          </div>
        ))}
      </section>

      <section style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <div style={{ padding: 12, borderRadius: 8, background: '#111', border: '1px solid #2a2a2a' }}>
          <span style={{ fontWeight: 700, fontSize: 12, color: '#aaa' }}>Uptime</span>
          <div style={{ fontFamily: 'monospace', fontSize: 18 }}>{uptime}</div>
        </div>
        <button onClick={startBuild} style={buttonStyle}>Start Build</button>
        <button onClick={stopBuild} style={buttonStyle}>Stop Build</button>
        <button onMouseDown={startListening} onMouseUp={stopListening} onTouchStart={startListening} onTouchEnd={stopListening} style={buttonStyle}>Hold to Speak</button>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 12 }}>
        <div style={{ padding: 12, borderRadius: 8, background: '#111', border: '1px solid #2a2a2a' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Transcript</div>
          <div style={{ minHeight: 40, fontFamily: 'monospace', fontSize: 14, color: '#9ae6b4' }}>{transcript || response}</div>
        </div>
        <form onSubmit={handleTextSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or type your command here..."
            style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid #333', background: '#111', color: '#e5e5e5' }}
          />
          <button type="submit" style={buttonStyle}>Send</button>
        </form>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: videoUrl ? '1fr 1fr' : '1fr', gap: 12, marginTop: 12 }}>
        <div style={{ padding: 12, borderRadius: 8, background: '#111', border: '1px solid #2a2a2a' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Video Diagnostics</div>
          {videoUrl ? (
            <video src={videoUrl} controls width="100%" />
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
              Waiting for build to generate video...
            </div>
          )}
        </div>
        <div style={{ padding: 12, borderRadius: 8, background: '#111', border: '1px solid #2a2a2a' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Satellite Preview</div>
          <img src="https://picsum.photos/seed/satellite/600/300" alt="Satellite preview" style={{ width: '100%', borderRadius: 6 }} />
        </div>
      </section>

      <section style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>System Log</div>
        <div style={{ maxHeight: 180, overflow: 'auto', fontFamily: 'monospace', fontSize: 12, color: '#c9f5d6' }}>
          {log.map((entry) => (
            <div key={entry.id} style={{ color: entry.type === 'ok' ? '#9ae6b4' : entry.type === 'warn' ? '#fbd38d' : '#f87171' }}>
              [{entry.time}] {entry.message}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const buttonStyle = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #2a2a2a',
  background: '#0a0a0a',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer'
};
