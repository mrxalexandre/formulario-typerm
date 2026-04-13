import fetch from 'node-fetch';

async function test() {
  const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm';
  
  // Try GET /question
  const res = await fetch(`${BASE_URL}/question`);
  console.log('GET /question:', res.status, await res.text());
}
test();
