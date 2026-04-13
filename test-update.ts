import fetch from 'node-fetch';

async function test() {
  const BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:6qBHg_Bm';
  
  // Try POST /form/{id}
  let res = await fetch(`${BASE_URL}/form/6`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'PESQUISA DE CLIMA UPDATED' })
  });
  console.log('POST /form/6:', res.status, await res.text());

  // Try PUT /form/{id}
  res = await fetch(`${BASE_URL}/form/6`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'PESQUISA DE CLIMA UPDATED' })
  });
  console.log('PUT /form/6:', res.status, await res.text());

  // Try PATCH /form/{id}
  res = await fetch(`${BASE_URL}/form/6`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'PESQUISA DE CLIMA UPDATED' })
  });
  console.log('PATCH /form/6:', res.status, await res.text());

  // Try POST /form with ID in body
  res = await fetch(`${BASE_URL}/form`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 6, title: 'PESQUISA DE CLIMA UPDATED' })
  });
  console.log('POST /form (with ID):', res.status, await res.text());
}
test();
