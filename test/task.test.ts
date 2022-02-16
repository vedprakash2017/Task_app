import app  from "../src/app";
import Task  from "../src/model/task";
import  request  from "supertest";
import redisClient  from "../src/db/redis-db";
import User  from "../src/model/user";
import db  from "./extra/db";

beforeEach(db.setUpDb);

test("create a new task", async () => {
  const res = await request(app)
    .post("/task")
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
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
    .get(`/task/${db.taskOne._id}`)
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send()
    .expect(200);
  const task = await Task.findById(res.body._id);
  expect(task).not.toBeNull();
});
test("get a task without auth", async () => {
  await request(app).get(`/task/${db.taskOne._id}`).send().expect(401);
});

test("update a task", async () => {
  const res = await request(app)
    .patch(`/task/${db.taskOne._id}`)
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send({
      is_completed: true,
    })
    .expect(200);
  const task = await Task.findById(res.body._id);
  expect(task).not.toBeNull();
  expect(task.is_completed).toBe(true);
});
test("update task without auth", async () => {
  await request(app).patch(`/task/${db.taskOne._id}`).send().expect(401);
});

test("Delete a task", async () => {
  const res = await request(app)
    .delete(`/task/${db.taskOne._id}`)
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send({
      is_completed: true,
    })
    .expect(200);
  const task = await Task.findById(res.body._id);
  expect(task).toBeNull();
});
test("Delete task without auth", async () => {
  await request(app).delete(`/task/${db.taskOne._id}`).send().expect(401);
});

test("get all current user tasks", async () => {
  const res = await request(app)
    .get(`/user/task`)
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send()
    .expect(200);

  const user = await User.findById(db.userOne._id.toString());
  if(user)
  {
  await user.populate({ path: "tasks" });
  //@ts-ignore
  await expect(JSON.stringify(user.tasks[0])).toEqual(
    JSON.stringify(res.body[0])
  );
  }
});

test("get all current user tasks without auth", async () => {
  await request(app).get(`/user/task`).send().expect(401);
});
test("delete all current user tasks", async () => {
  const res = await request(app)
    .delete(`/user/task`)
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send()
    .expect(200);
  expect(res.body.length).toBe(0);
});

test("delete all current user tasks without auth", async () => {
  await request(app).delete(`/user/task`).send().expect(401);
});
