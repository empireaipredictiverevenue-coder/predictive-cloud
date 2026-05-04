'use client';

import { useState } from 'react';

export default function StormTracker() {
  const [zip, setZip] = useState('');
  const [email, setEmail] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setScanning(true);

    await fetch('/api/storm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zip, email }),
    });

    alert('ZIP scanned! Check your email for the cinematic damage video.');
    setScanning(false);
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-2xl border-2 border-[#39ff14] bg-gray-900 p-8 shadow-[0_0_40px_rgba(57,255,20,0.2)]">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Unlock Local Storm Data
          </h1>
          <p className="text-[#00ffff] font-bold uppercase tracking-widest text-sm">
            Enter a ZIP. Get the cinematic damage video.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ZIP */}
          <div>
            <label htmlFor="zip" className="block text-[#00ffff] font-bold mb-2 uppercase text-sm tracking-widest">
              Target ZIP Code
            </label>
            <input
              id="zip"
              type="text"
              required
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="e.g. 90210"
              className="w-full bg-black text-[#00ffff] text-2xl p-4 border-2 border-gray-800 focus:border-[#39ff14] outline-none rounded text-center font-black tracking-widest placeholder-gray-700 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-[#00ffff] font-bold mb-2 uppercase text-sm tracking-widest">
              Email Destination
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Where do we send the video?"
              className="w-full bg-black text-white text-xl p-4 border-2 border-gray-800 focus:border-[#39ff14] outline-none rounded text-center placeholder-gray-700 transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={scanning}
            className="w-full bg-[#39ff14] hover:bg-[#00ffff] text-black font-black text-2xl py-6 rounded transition-all uppercase tracking-tight shadow-[0_0_15px_#39ff14] hover:shadow-[0_0_25px_#00ffff] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? (
              <span className="flex items-center justify-center gap-3">
                <svg aria-hidden="true" className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                RENDERING SATELLITE DATA...
              </span>
            ) : (
              'DROP COIN & UNLOCK VIDEO'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600 uppercase tracking-widest">
          Powered by Empire AI Predictive Cloud
        </p>
      </div>
    </main>
  );
}
