const { DB, Role } = require("./src/database/database.js");

// database.DB.getMenu().then(console.log);

// async function test() {
//   console.log(DB);
//   await DB.initialized;
//   await DB.addUser({
//     name: "Matthias",
//     email: "southwickmatthias@gmail.com",
//     password: "abc123",
//     roles: [{ role: Role.Admin }],
//   });
//   let a = await DB.getUser("southwickmatthias@gmail.com", "abc123");
  
// }

// test();
//

test('test menu',async ()=>{
    await DB.initialized;
    let img = 'https://media.istockphoto.com/id/1042948900/photo/pizza-pepperoni-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=2WZk35fHKdCCh1FU-fOX6hrixIWB3IlMl0FspKaOraA=';
    await DB.addMenuItem({title:'Pepperoni',description:'Pizza with Pepperoni\'s',image:img,price:22})
    let a = await DB.getMenu();
    expect(a.filter(e=>e.title=='Pepperoni')[0].price).toBe(22);
});

test('create store',async ()=>{
    await DB.initialized;
    await DB.addUser({
      name: "Matthias",
      email: "southwickmatthias@gmail.com",
      password: "abc123",
      roles: [{ role: Role.Admin }],
    });
    let a = await DB.getUser("southwickmatthias@gmail.com", "abc123");
    expect(a.name).toBe('Matthias');
    let f = await DB.createFranchise({name:'MS Pizzas',admins:[{email:'southwickmatthias@gmail.com'}]});
    let store = await DB.createStore(f.id,{name:'M Store 1'})
    expect(store.name).toBe('M Store 1');
    let r = await DB.getFranchise(f);
    expect(r.name).toBe('MS Pizzas');
    expect(r.stores[0].name).toBe('M Store 1');
    expect(DB.deleteFranchise(f.id)).resolves.toBe(undefined);
})

test('unknown person',async ()=>{
    await DB.initialized;
    expect(DB.getUser('rando','123')).rejects.toThrow('unknown user');
});