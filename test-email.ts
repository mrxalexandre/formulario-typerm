import fetch from 'node-fetch';

async function test() {
  const res = await fetch('https://formsubmit.co/ajax/mrxalexandre@gmail.com', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        name: "FormFlow System",
        message: "A new submission was received!"
    })
  });
  console.log(res.status, await res.text());
}
test();
