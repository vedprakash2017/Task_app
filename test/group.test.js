const Group = require("../src/model/group");
const request = require("supertest");
const Task = require("../src/model/task");
const app = require("../src/app");
const {
  setUpDb,
  userOne,
  taskFour,
  groupOne,
  groupTwo,
  groupThree,
} = require("./extra/db");
const User = require("../src/model/user");

beforeEach(setUpDb);

test("create a new group without any task", async () => {
  const res = await request(app)
    .post("/group")
    .set("Authorization", `Bearer ${userOne.token[0]}`)
    .send({
      name: "new group",
    })
    .expect(201);
  const group = await Group.findById(res.body._id);
  expect(group).not.toBeNull();
});
test("create a new group with a task", async () => {
  console.log(taskFour);
  const res = await request(app)
    .post("/group")
    .set("Authorization", `Bearer ${userOne.token[0]}`)
    .send({
      name: "new group",
      tasks: [taskFour._id.toString()],
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
      tasks: [taskFour._id.toString()],
    })
    .expect(401);
});

test("get a group", async () => {
  const res = await request(app)
    .get(`/group/${groupTwo._id}`)
    .set("Authorization", `Bearer ${userOne.token[0]}`)
    .send()
    .expect(200);
  const group = await Group.findById(res.body[0].group_id);
  expect(group).not.toBeNull();
});
test("get a group without auth", async () => {
  await request(app).get(`/group/${groupOne._id}`).send().expect(401);
});

test("update a group", async () => {
  const res = await request(app)
    .patch(`/group/${groupTwo._id}`)
    .set("Authorization", `Bearer ${userOne.token[0]}`)
    .send({
      is_completed: true,
    })
    .expect(200);
  const task = await Task.findById(res.body[0]._id);
  expect(task.is_completed).toBe(true);
});
test("update task without auth", async () => {
  await request(app).patch(`/group/${groupTwo._id}`).send().expect(401);
});

test("Delete a group", async () => {
  const res = await request(app)
    .delete(`/group/${groupTwo._id}`)
    .set("Authorization", `Bearer ${userOne.token[0]}`)
    .send()
    .expect(200);
});
test("Delete task without auth", async () => {
  await request(app)
    .delete(`/group/${groupOne._id}`)
    .send({
      text: "clean your room",
    })
    .expect(401);
});
