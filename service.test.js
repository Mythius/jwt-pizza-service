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

jest.setTimeout(15000);

test("test menu", async () => {
  await DB.initialized;
  let img =
    "https://media.istockphoto.com/id/1042948900/photo/pizza-pepperoni-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=2WZk35fHKdCCh1FU-fOX6hrixIWB3IlMl0FspKaOraA=";
  await DB.addMenuItem({
    title: "Pepperoni",
    description: "Pizza with Pepperoni's",
    image: img,
    price: 22,
  });
  let a = await DB.getMenu();
  expect(a.filter((e) => e.title == "Pepperoni")[0].price).toBe(22);
});

test("create store", async () => {
  await DB.initialized;
  // Create user
  await DB.addUser({
    name: "Matthias",
    email: "southwickmatthias@gmail.com",
    password: "abc123",
    roles: [{ role: Role.Admin }],
  });
  let a = await DB.getUser("southwickmatthias@gmail.com", "abc123");
  expect(a.name).toBe("Matthias");

  // Create Franchise and Store
  let f = await DB.createFranchise({
    name: "MS Pizzas",
    admins: [{ email: "southwickmatthias@gmail.com" }],
  });
  let store = await DB.createStore(f.id, { name: "M Store 1" });
  expect(store.name).toBe("M Store 1");

  // Get Franchise and Store and User
  let r = await DB.getFranchise(f);
  await DB.getUserFranchises(a.id);
  expect(r.name).toBe("MS Pizzas");
  expect(r.stores[0].name).toBe("M Store 1");

  // Add Another Franchise owner
  await DB.addUser({
    name: "M2",
    email: "g@gmail.com",
    password: "abc123555",
    roles: [{ role: Role.Franchisee, object: "MS Pizzas" }],
  });

  // Add Diner Order

  let order = { franchiseId: f.id, storeId: store.id, items: [{ menuId:1, description:'Hot Pep Pizza', price: 22}] };
  await DB.addDinerOrder(a, order);

  
  let o = await DB.getOrders(a);
  expect(o.orders.length).toBe(1);

  // Clean up and Test Delete
  await DB.deleteStore(f.id, r.stores[0].id);
  let df = await DB.deleteFranchise(f.id);
  expect(df).toBeFalsy();
});

test("unknown person", async () => {
  await DB.initialized;
  expect(DB.getUser("rando", "123")).rejects.toThrow("unknown user");
});

test("unknown franchize", async () => {
  let error = false;
  try {
    await DB.createFranchise({
      name: "MS Pizzas",
      admins: [{ email: "random-email@gmail.com" }],
    });
  } catch (e) {
    error = true;
    expect(e).toBeTruthy();
  }
  expect(error).toBe(true);
});

test("update user and login", async () => {
  await DB.initialized;
  let u = await DB.addUser({
    name: "Matthias333",
    email: "333@gmail.com",
    password: "abc123111111",
    roles: [{ role: Role.Admin }],
  });
  await DB.updateUser(u.id, "aaa@gmail.com", "MnMnMn");

  let token = "hi";
  await DB.loginUser(u.id, token);

  let li = await DB.isLoggedIn(token);
  expect(li).toBe(true);

  await DB.logoutUser(token);

  let o = await DB.getOrders(u);
  let worked = !!o;
  expect(worked).toBe(true);

  li = await DB.isLoggedIn(token);
  expect(li).toBe(false);
});
