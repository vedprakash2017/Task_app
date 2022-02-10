const app = require("../src/app");
const Task = require("../src/model/task");
const request = require("supertest");
const redisClient = require("../src/db/redis-db");
const User = require("../src/model/user");
const { setUpDb, userOne, taskOne } = require("./extra/db");

beforeEach(setUpDb);

test("create a new task", async () => {
  const res = await request(app)
    .post("/task")
    .set("Authorization", `Bearer ${userOne.token[0]}`)
    .send({
      text: "clean your room",
    })
    .expect(201);
  const task = await Task.findById(res.body._id);
  expect(task).not.toBeNull();
});

test("create a new task without auth", async () => {
  await request(app)
    .post("/task")
    .send({
      text: "clean your room 12",
    })
    .expect(401);
});
test("get a task", async () => {
  const res = await request(app)
    .get(`/task/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.token[0]}`)
    .send()
    .expect(200);
  const task = await Task.findById(res.body._id);
  expect(task).not.toBeNull();
});
test("get a task without auth", async () => {
  await request(app).get(`/task/${taskOne._id}`).send().expect(401);
});

test("update a task", async () => {
  const res = await request(app)
    .patch(`/task/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.token[0]}`)
    .send({
      is_completed: true,
    })
    .expect(200);
  const task = await Task.findById(res.body._id);
  expect(task).not.toBeNull();
  expect(task.is_completed).toBe(true);
});
test("update task without auth", async () => {
  await request(app).patch(`/task/${taskOne._id}`).send().expect(401);
});

test("Delete a task", async () => {
  const res = await request(app)
    .delete(`/task/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.token[0]}`)
    .send({
      is_completed: true,
    })
    .expect(200);
  const task = await Task.findById(res.body._id);
  expect(task).toBeNull();
});
test("Delete task without auth", async () => {
  await request(app).delete(`/task/${taskOne._id}`).send().expect(401);
});

test("get all current user tasks", async () => {
  const res = await request(app)
    .get(`/user/task`)
    .set("Authorization", `Bearer ${userOne.token[0]}`)
    .send()
    .expect(200);

  const user = await User.findById(userOne._id.toString());
  await user.populate({ path: "tasks" });

  await expect(JSON.stringify(user.tasks[0])).toEqual(
    JSON.stringify(res.body[0])
  );
});

test("get all current user tasks without auth", async () => {
  await request(app).get(`/user/task`).send().expect(401);
});
test("delete all current user tasks", async () => {
  const res = await request(app)
    .delete(`/user/task`)
    .set("Authorization", `Bearer ${userOne.token[0]}`)
    .send()
    .expect(200);
  expect(res.body.length).toBe(0);
});

test("delete all current user tasks without auth", async () => {
  await request(app).delete(`/user/task`).send().expect(401);
});
