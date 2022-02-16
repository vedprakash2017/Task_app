import app from "../src/app";
import request from "supertest";
import User from "../src/model/user";
import redisClient from "../src/db/redis-db";
import db from "./extra/db";

beforeEach(db.setUpDb);

test("check signup", async () => {
  const res = await request(app)
    .post("/user/signup")
    .send({
      username: "vedu",
      password: 1234567,
    })
    .expect(201);
  // check user is saved on database
  const user = await User.findById(res.body.user._id);
  if(user === null)
  expect(user).not.toBeNull;

  else
  {
  //check password is not simple
  expect(user.password).not.toBe(1234567);
  expect(user.token[0]).toBe(res.body.token);
  }
});

test("check login ", async () => {
  const res = await request(app)
    .post("/user/login")
    .send({ username:  db.userOne.username, password: db.userOne.password })
    .expect(200);

  const user = await User.findById(res.body.user._id);
  if(user === null)
  expect(user).not.toBeNull();
  else
  expect(user.token[1]).toBe(res.body.token);
});

test("check login with bad cred", async () => {
  await request(app)
    .post("/user/login")
    .send({ username: db.userOne.username, password: 123 })
    .expect(400);
});

test("check logout ", async () => {
  const res = await request(app)
    .get("/user/logout")
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send()
    .expect(200);

  const user = await User.findById(res.body._id);
  if(user)
  expect(user.token.length).toBe(0);

  expect(user).not.toBeNull();
});

test("check logout with bad cred", async () => {
  await request(app)
    .post("/user/login")
    .send({ username: db.userOne.username, password: 123 })
    .expect(400);
});

test("get current user all details with auth ", async () => {
  await request(app)
    .get("/user/me")
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send()
    .expect(200);
});

test("without auth get current user ", async () => {
  await request(app).get("/user/me").send().expect(401);
});

test("delete current user with auth ", async () => {
  const res = await request(app)
    .delete("/user/delete")
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send()
    .expect(200);
  const user = await User.findById(res.body._id);
  expect(user).toBeNull;
});
test("without auth delete current user", async () => {
  await request(app).delete("/user/delete").send().expect(401);
});
