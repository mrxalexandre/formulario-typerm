import fetch from 'node-fetch';

async function test() {
  const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm';
  
  // Try POST /submission with form and content
  const res = await fetch(`${BASE_URL}/submission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ form: 6, content: { "17": "Sim" } })
  });
  console.log('POST /submission (form, content):', res.status, await res.text());
}
test();
