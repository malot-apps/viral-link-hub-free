// Automated Test Suite for Viral Link Hub Supabase Architecture
const BASE_URL = 'http://127.0.0.1:3000';

async function testEndpoint(name, url, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, options);
    const data = await res.json().catch(() => ({}));
    const pass = res.status >= 200 && res.status < 300 && data.success !== false;
    console.log(`[TEST] ${name}: ${pass ? 'PASS' : 'FAIL'} (status: ${res.status})`);
    return { pass, data, res };
  } catch (err) {
    console.log(`[TEST] ${name}: FAIL (error: ${err.message})`);
    return { pass: false, error: err };
  }
}

async function runTests() {
  console.log('--- STARTING VIRAL LINK HUB ARCHITECTURE TEST ---');

  // 1. Public App / API
  await testEndpoint('Public App-Config', '/api/v1/app-config');
  await testEndpoint('Public Movies List', '/api/v1/movies');
  await testEndpoint('Public Movies Filter (Featured)', '/api/v1/movies?featured=true');
  await testEndpoint('Public Analytics Ping', '/api/v1/analytics/ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 108492041 }),
  });

  // 2. Ad Tracking
  await testEndpoint('Ad Tracking Event (Impression)', '/api/v1/analytics/ad-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 108492041, event: 'ad_impression', placement: 'home_banner' }),
  });
  await testEndpoint('Ad Tracking Event (Click)', '/api/v1/analytics/ad-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 108492041, event: 'ad_click', placement: 'unlock_modal' }),
  });

  // 3. Telegram Flow & User Sync
  const syncRes = await testEndpoint('Telegram User Sync', '/api/v1/user/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      initData: JSON.stringify({
        id: 108492041,
        first_name: 'Alex',
        username: 'alex_cyber',
      }),
      startParam: 'ref_VLH9041',
    }),
  });

  await testEndpoint('Telegram Bot Webhook (/start)', '/api/v1/telegram/bot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        chat: { id: 108492041 },
        from: { id: 108492041, first_name: 'Alex', username: 'alex_cyber' },
        text: '/start ref_VLH9041',
      },
    }),
  });

  // 4. Referral & Profile
  await testEndpoint('User Profile & Referral Retrieval', '/api/v1/user/profile?userId=108492041');

  // 5. Premium Reward Claim
  await testEndpoint('Premium Reward Claim Endpoint', '/api/v1/premium/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: '108492041' }),
  });

  // 6. Admin Authentication & Session
  const loginRes = await testEndpoint('Admin Login (Valid Credentials)', '/api/v1/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'demo_admin', password: 'ViralDemo2026!' }),
  });

  let cookieHeader = '';
  if (loginRes.res) {
    const rawCookie = loginRes.res.headers.get('set-cookie');
    if (rawCookie) cookieHeader = rawCookie.split(';')[0];
  }

  await testEndpoint('Admin Session Verification (/admin/me)', '/api/v1/admin/auth/me', {
    headers: { Cookie: cookieHeader },
  });

  // 7. Video CRUD
  const createVideoRes = await testEndpoint('Admin Video Create', '/api/v1/admin/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      title: '[TEST] Automated Test Video',
      description: 'Test description for video CRUD verification',
      category: 'Viral Movies',
      streamUrl: 'https://fastcdn.stream/v/test-video',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
      requiredAdsCount: 2,
      isFeatured: false,
    }),
  });

  const createdId = createVideoRes.data?.data?._id || createVideoRes.data?.data?.id;

  if (createdId) {
    await testEndpoint('Admin Video Update', `/api/v1/admin/videos/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      body: JSON.stringify({ isFeatured: true, title: '[TEST] Updated Video Title' }),
    });

    await testEndpoint('Admin Video Delete', `/api/v1/admin/videos/${createdId}`, {
      method: 'DELETE',
      headers: { Cookie: cookieHeader },
    });
  }

  // 8. Settings
  await testEndpoint('Admin Settings Read', '/api/v1/admin/settings', {
    headers: { Cookie: cookieHeader },
  });

  await testEndpoint('Admin Settings Update', '/api/v1/admin/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({ announcementBannerText: '🔥 Verified test banner' }),
  });

  // 9. Analytics & Audit
  await testEndpoint('Admin Dashboard Stats', '/api/v1/admin/stats', {
    headers: { Cookie: cookieHeader },
  });

  await testEndpoint('Admin Audit Logs', '/api/v1/admin/audit-logs', {
    headers: { Cookie: cookieHeader },
  });

  // 10. Admin Logout
  await testEndpoint('Admin Logout', '/api/v1/admin/auth/logout', {
    method: 'POST',
    headers: { Cookie: cookieHeader },
  });

  console.log('--- TEST RUN COMPLETED ---');
}

runTests();
