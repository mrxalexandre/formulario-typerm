import fetch from 'node-fetch';

async function test() {
  const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm';
  
  const res = await fetch(`${BASE_URL}/swagger.json`);
  if (res.ok) {
    const data = await res.json();
    console.log(Object.keys(data.paths));
  } else {
    console.log('No swagger.json found');
  }
}
test();
