// .then(e=>e.json().then(console.log));
async function main() {
  let req = await fetch("http://localhost:3000/api/auth", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@test.test", password: "test" }),
  });
  let t = await req.json();
  const token = t.token;

  let req2 = await fetch("http://localhost:3000/api/order", {
    method: "GET",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`},
  });
  let text2 = await req2.json();
  console.log(text2);

  
  let req3 = await fetch("http://localhost:3000/api/order", {
    method: "GET",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token+'hio'}`},
  });
  let text3 = await req3.json();
  console.log(text3);
}

main();
