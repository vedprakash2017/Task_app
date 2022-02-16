import * as express from "express";
import Group from "../model/group";
import Task from "../model/task";
import auth from "../middleware/auth";
import User from "../model/user";
import { ObjectId } from "mongodb";
import redisClient from "../db/redis-db";
import  redisHandler  from "./redisFunction";
import {Request , Response } from 'express';
import kafka from '../db/kafka'
import { TaskDocument } from "../@types/module";

let route =  express.Router();


route.get("/group/all", async (req:Request, res:Response) => {
  try {
    const groups = await Group.find({});
    res.send(groups);
  } catch (e) {
    res.status(400).send();
  }
});

route.post("/group", auth, async (req:Request , res:Response) => {

  let tasks = req.body;
  let currentUser:{_id:string }
  currentUser = res.locals.user
  // let res.locals.user:{_id:string}
  tasks["assigned_to"] = res.locals.user._id;

  try {
    const group = new Group(tasks);
    let ids = group.tasks;
    //checking group name is valid or not
    const matchGroup = await Group.find({
      assigned_to: res.locals.user._id,
      name: group.name,
    });

    if (matchGroup.length > 0)
      return res.status(400).send("Group name already exists!");

    if (ids.length > 0) {
      //checking  all ids are valid or not
      const allTasks = await Task.find({ assigned_to: res.locals.user._id }); // getting all current user tasks

      const allTasksId = allTasks.map((task:TaskDocument) => {
        // extract all task ids
        return task._id.toString();
      });
      const check = ids.every((id:string) => {
        // check if all req json ids match with user task id or not
        return allTasksId.includes(id);
      });
      if (!check) {
        return res.status(500).send("Please provide valid tasks");
      }
      //checking if any task added in any group previously
      const firstTime = allTasks.every((task:TaskDocument) => {
        if (ids.includes(task._id.toString()) && task.group_id) return 0;
        else return 1;
      });

      if (!firstTime)
        return res.status(404).send("task already assigned to some group");

      // update tasks group_id
      // in mongodb database
      tasks = await Task.updateMany(
        { _id: { $in: ids } },
        { group_id: group._id }
      );
      if (tasks.modifiedCount === 0) return res.status(500).send();

      // in redis database
      await redisHandler.redisGroupHandler(
        "create",
        res.locals.user._id,
        group._id.toString(),
        ids
      );
    }

    await kafka.producer.sendMessage({data:group , type:'group'});
    // await group.save();
    await redisClient.lPush(res.locals.user._id + ":group", JSON.stringify(group));
    res.status(201).send(group);
  } catch (e) {
    res.status(400).send(e);
  }
});

route.get("/group/:group_id", auth, async (req, res) => {
  try {
    // const tasks = await Task.find({group_id})
    const tasks = await redisHandler.redisGroupHandler(
      "get",
      res.locals.user._id,
      req.params.group_id,
      undefined
    );
    if (!tasks) return res.status(404).send();
    res.send(tasks);
  } catch (e) {
    res.status(400).send();
  }
});

route.patch("/group/:group_id", auth, async (req:Request, res:Response) => {
  try {
    const tasks = await redisHandler.redisGroupHandler(
      "update",
      res.locals.user._id,
      req.params.group_id,
      undefined
    );
    await Task.updateMany(
      { group_id: req.params.group_id },
      { is_completed: true }
    );
    if (!tasks) return res.status(404).send();
    res.send(tasks);
  } catch (e) {
    res.status(400).send();
  }
});

route.delete("/group/:group_id", auth, async (req:Request, res:Response) => {
  const group_id = req.params.group_id;
  try {
    const deletedTasks = await redisHandler.redisGroupHandler(
      "delete",
      res.locals.user._id,
      req.params.group_id,
      undefined
    );
    const group = await Group.deleteOne({
      _id: group_id,
      assigned_to: res.locals.user._id,
    });
    const tasks = await Task.deleteMany({ group_id });

    if (tasks.deletedCount !== 0 && group) return res.send(deletedTasks);
    return res.status(404).send();
  } catch (e) {
    res.status(400).send();
  }
});


module.exports = route;
