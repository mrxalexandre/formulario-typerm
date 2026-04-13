import fetch from 'node-fetch';

async function test() {
  const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm';
  
  try {
    const res = await fetch(`${BASE_URL}/form`);
    console.log('GET /form:', res.status, await res.text());
  } catch (e) {
    console.error(e);
  }
}
test();
