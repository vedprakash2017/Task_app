import * as express from "express"
const route = express.Router()
import Task from "../model/task"
import auth from "../middleware/auth"
import redisClient from "../db/redis-db"
import  redisHandler  from "./redisFunction"
import * as mongoose from "mongoose"
import { customRequest, UserDocument } from "../@types/module"

//manipulating single task
route.post("/task", auth, async (req:customRequest, res) => {
  let task = req.body;
  task["assigned_to"] = req.user._id;
  try {
    task = new Task(task);
    await task.save();
    await redisClient.lPush(req.user.id, JSON.stringify(task));
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

route.get("/task/:id", auth, async (req:customRequest, res) => {
  const task_id = req.params.id;
  try {
    // const task  = await Task.findById(task_id)
    const task = await redisHandler.redisTaskHandler("get", req.user._id, task_id , undefined);
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

route.patch("/task/:id", auth, async (req:customRequest, res) => {
  const task_id = req.params.id;

  const updates = req.body;
  const updatesKeys = Object.keys(updates);

  // allow field to save a task
  const allow = ["text", "due_date", "is_completed", "assigned_to", "group_id"];

  // check if all update json field are valid or not
  const check = updatesKeys.every((key) => allow.includes(key));
  if (!check) res.status(404).send();

  try {
    // find task by id and update it with given data
    // const task1 = await Task.findById(task_id)
    let task = await redisHandler.redisTaskHandler("get", req.user._id, task_id , undefined);
    updatesKeys.map((key) => {
      task[key] = updates[key];
    });

    const x = await redisHandler.redisTaskHandler("update", req.user._id, task_id, task);

    task = new Task(task);
    await Task.updateOne({ _id: task._id }, task);
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

route.delete("/task/:id", auth, async (req:customRequest, res) => {
  const task_id = req.params.id;
  try {
    await Task.findByIdAndRemove(task_id);
    const task = await redisHandler.redisTaskHandler("delete", req.user._id, task_id , undefined);
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(400).send();
  }
});

// manipulating all current user task

route.get("/user/task", auth, async (req:customRequest, res) => {
  try {
    // await req.user.populate({path:'tasks'})
    const tasks = await redisHandler.redisTaskHandler("all", req.user._id , undefined , undefined);
    res.send(tasks);
  } catch (e) {
    res.status(400).send();
  }
});

route.delete("/user/task", auth, async (req:customRequest, res) => {
  try {
    await Task.deleteMany({ assigned_to: req.user._id });
    const tasks = await redisHandler.redisTaskHandler("delete_all" , undefined , undefined , undefined);
    if (!tasks) return res.status(500).send();

    res.send(tasks);
  } catch (e) {
    res.status(400).send();
  }
});

// get all tasks or delete all tasks of all users from mongodb ( only for testing )

route.get("/tasks/all", async (req, res) => {
  try {
    const tasks = await Task.find();
    if (!tasks) return res.status(404).send();

    res.send(tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

route.delete("/tasks/all", async (req, res) => {
  try {
    const tasks = await Task.deleteMany();
    if (!tasks) return res.status(404).send();

    res.send();
  } catch (e) {
    res.status(400).send(e);
  }
});

export default route;
