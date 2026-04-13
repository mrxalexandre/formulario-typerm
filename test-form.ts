import fetch from 'node-fetch';

async function test() {
  const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm/form/6');
  console.log('Form 6:', await res.text());

  const resQ = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm/question?form_id=6');
  console.log('Questions for Form 6:', await resQ.text());
}
test();
