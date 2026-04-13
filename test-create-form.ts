import fetch from 'node-fetch';

async function test() {
  const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm';
  
  const payload = {
    title: 'Test Form',
    slug: 'test-form',
    settings: {
      bg_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      font_family: 'Inter',
      primary_color: '#667eea',
      admin_email: '',
      auto_advance: true,
      hide_browser_ui: false,
    }
  };
  const safePayload = { ...payload, name: payload.title };

  const res = await fetch(`${BASE_URL}/form`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(safePayload),
  });
  console.log('POST /form:', res.status, await res.text());
}
test();
