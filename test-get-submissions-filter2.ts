import fetch from 'node-fetch';

async function test() {
  const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm';
  
  // Try GET /submission?form_id=9
  const res = await fetch(`${BASE_URL}/submission?form_id=9`);
  console.log('GET /submission?form_id=9:', res.status, await res.text());
}
test();
