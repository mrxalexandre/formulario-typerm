import fetch from 'node-fetch';

async function test() {
  const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm';
  
  // Restore form 6
  let res = await fetch(`${BASE_URL}/form/6`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      title: 'PESQUISA DE CLIMA',
      slug: 'PESQUISACLIMAAHC',
      settings: {"admin_email":"mrxalexandre@gmail.com","bg_gradient":"linear-gradient(135deg, #fa709a 0%, #fee140 100%)","font_family":"Poppins","auto_advance":true,"primary_color":"#ff3300"},
      notifications: {},
      is_active: false
    })
  });
  console.log('Restore Form 6:', res.status, await res.text());

  // Test question update
  res = await fetch(`${BASE_URL}/question/17`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Gosta de trabalhar aqui UPDATED' })
  });
  console.log('POST /question/17:', res.status, await res.text());

  res = await fetch(`${BASE_URL}/question/17`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label: 'Gosta de trabalhar aqui' })
  });
  console.log('PATCH /question/17:', res.status, await res.text());
}
test();
