import fetch from 'node-fetch';

async function test() {
  const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm';
  
  // Try GET /submission
  const res = await fetch(`${BASE_URL}/submission`);
  console.log('GET /submission:', res.status, await res.text());
}
test();
