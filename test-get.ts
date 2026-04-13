import fetch from 'node-fetch';

async function test() {
  const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm/form');
  console.log(res.status);
  console.log(await res.text());
}
test();
