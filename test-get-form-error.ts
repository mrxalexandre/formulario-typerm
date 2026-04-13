import fetch from 'node-fetch';

async function test() {
  const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm';
  
  try {
    const res = await fetch(`${BASE_URL}/form/invalid-id`);
    console.log('GET /form/invalid-id:', res.status, res.statusText, await res.text());
  } catch (e) {
    console.error(e);
  }
}
test();
