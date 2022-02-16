import Group from "../src/model/group";
import request from "supertest";
import Task from "../src/model/task";
import app from "../src/app";
import db from "./extra/db";
const User = require("../src/model/user");

beforeEach(db.setUpDb);

test("create a new group without any task", async () => {
  const res = await request(app)
    .post("/group")
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send({
      name: "new group",
    })
    .expect(201);
  const group = await Group.findById(res.body._id);
  expect(group).not.toBeNull();
});
test("create a new group with a task", async () => {
  console.log(db.taskFour);
  const res = await request(app)
    .post("/group")
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send({
      name: "new group",
      tasks: [db.taskFour._id.toString()],
    })
    .expect(201);
  const group = await Group.findById(res.body._id);
  expect(group).not.toBeNull();
});

test("create a new group without auth", async () => {
  await request(app)
    .post("/task")
    .send({
      name: "new group",
      tasks: [db.taskFour._id.toString()],
    })
    .expect(401);
});

test("get a group", async () => {
  const res = await request(app)
    .get(`/group/${db.groupTwo._id}`)
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send()
    .expect(200);
  const group = await Group.findById(res.body[0].group_id);
  expect(group).not.toBeNull();
});
test("get a group without auth", async () => {
  await request(app).get(`/group/${db.groupOne._id}`).send().expect(401);
});

test("update a group", async () => {
  const res = await request(app)
    .patch(`/group/${db.groupTwo._id}`)
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send({
      is_completed: true,
    })
    .expect(200);
  const task = await Task.findById(res.body[0]._id);
  expect(task.is_completed).toBe(true);
});
test("update task without auth", async () => {
  await request(app).patch(`/group/${db.groupTwo._id}`).send().expect(401);
});

test("Delete a group", async () => {
  const res = await request(app)
    .delete(`/group/${db.groupTwo._id}`)
    .set("Authorization", `Bearer ${db.userOne.token[0]}`)
    .send()
    .expect(200);
});
test("Delete task without auth", async () => {
  await request(app)
    .delete(`/group/${db.groupOne._id}`)
    .send({
      text: "clean your room",
    })
    .expect(401);
});
