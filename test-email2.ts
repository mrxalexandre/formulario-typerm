import fetch from 'node-fetch';

async function test() {
  const res = await fetch('https://formsubmit.co/ajax/mrxalexandre@gmail.com', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': 'https://ais-dev-6zur742nzdv6v4egwbvbsf-72468659708.us-west2.run.app'
    },
    body: JSON.stringify({
        name: "FormFlow System",
        message: "A new submission was received!"
    })
  });
  console.log(res.status, await res.text());
}
test();
