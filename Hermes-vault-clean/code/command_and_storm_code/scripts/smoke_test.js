// Lightweight smoke tests for the Hermes/Storm integration
// Assumes Next.js dev server is running on http://localhost:3000

async function testRoot(base) {
  try {
    const res = await fetch(base + '/');
    const ok = res.ok;
    const text = await res.text();
    console.log('[Smoke] Root status:', res.status, ok ? 'OK' : 'ERR', '| body length', text.length);
  } catch (e) {
    console.error('[Smoke] Root test failed:', e.message);
  }
}

async function testHermes(base) {
  try {
    const res = await fetch(base + '/api/hermes/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'status' }),
    });
    const data = await res.json().catch(() => null);
    console.log('[Smoke] Hermes route:', res.status, data ? data : '(no json)');
  } catch (e) {
    console.error('[Smoke] Hermes test failed:', e.message);
  }
}

async function testStorm(base) {
  // 1) invalid payload -> expect 400
  try {
    const res1 = await fetch(base + '/api/storm/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zip: 'abc', email: 'not-an-email' }),
    });
    console.log('[Smoke] Storm route (invalid) =>', res1.status);
  } catch (e) {
    console.error('[Smoke] Storm invalid test failed:', e.message);
  }

  // 2) valid payload -> may return 500 if envs not set
  try {
    const res2 = await fetch(base + '/api/storm/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zip: '12345', email: 'test@example.com' }),
    });
    const data = await res2.json().catch(() => null);
    console.log('[Smoke] Storm route (valid) =>', res2.status, data ? data : '(no json)');
  } catch (e) {
    console.error('[Smoke] Storm valid test failed:', e.message);
  }
}

async function testHealth(base) {
  try {
    const res = await fetch(base + '/api/health');
    const data = await res.json().catch(() => null);
    console.log('[Smoke] Health endpoint:', res.status, data ? data : '(no json)');
  } catch (e) {
    console.error('[Smoke] Health test failed:', e.message);
  }
}

async function runAll() {
  const base = 'http://localhost:3000';
  console.log('[Smoke] Starting tests against', base);
  await testRoot(base);
  await testHermes(base);
  await testHealth(base);
  await testStorm(base);
}

runAll().then(() => {
  console.log('[Smoke] All tests finished.');
  process.exit(0);
}).catch((err) => {
  console.error('[Smoke] Unexpected error:', err);
  process.exit(1);
});
