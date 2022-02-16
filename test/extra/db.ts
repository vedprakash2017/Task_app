import Mongoose from "mongoose";
import * as jwt from "jsonwebtoken";
import User from "../../src/model/user";
import Task from "../../src/model/task";
import Group from "../../src/model/group";
import redisClient from "../../src/db/redis-db";

const privateKey = process.env.privateKey;


const id = () => {
  return new Mongoose.Types.ObjectId();
};
const userId1 = new Mongoose.Types.ObjectId();
const userId2 = new Mongoose.Types.ObjectId();

interface userType {
  _id: Mongoose.Types.ObjectId,
  username:string,
  password:string|number,
  token: Array<string>
}

const userOne:userType = {
  _id: userId1,
  username: "ved",
  password: 12345678,
  token: [jwt.sign({ _id: userId1 }, privateKey!)],
};

const userTwo:userType = {
  _id: userId2,
  username: "sonu",
  password: "sonusonu",
  token: [jwt.sign({ _id: userId2 }, privateKey!)],
};



interface taskType {
  _id: Mongoose.Types.ObjectId,
  text:string,
  is_completed:Boolean,
  assigned_to:string,
  [key:string]:any
}

const taskOne:taskType = {
  _id: id(),
  text: "task one",
  is_completed: false,
  assigned_to: userOne._id.toString(),
};
const taskTwo:taskType = {
  _id: id(),
  text: "task two",
  is_completed: false,
  assigned_to: userOne._id.toString(),
};
const taskThree:taskType = {
  _id: id(),
  text: "task three",
  is_completed: false,
  assigned_to: userTwo._id.toString(),
};
const taskFour:taskType = {
  _id: id(),
  text: "task Four",
  is_completed: false,
  assigned_to: userOne._id.toString(),
};



interface groupType {
  _id: Mongoose.Types.ObjectId,
  name:string,
  assigned_to:string,
  tasks: Array<string>,
  __v:Number
}

const groupOne:groupType = {
  name: "group 1",
  tasks: [],
  assigned_to: userOne._id.toString(),
  _id: id(),
  __v: 0,
};
const groupTwo:groupType = {
  name: "group 2",
  tasks: [taskOne._id.toString(), taskTwo._id.toString()],
  assigned_to: userOne._id.toString(),
  _id: id(),
  __v: 0,
};
const groupThree:groupType = {
  name: "group 3",
  tasks: [taskThree._id.toString()],
  assigned_to: userTwo._id.toString(),
  _id: id(),
  __v: 0,
};

taskOne["group_id"] = groupTwo._id.toString();
taskTwo["group_id"] = groupTwo._id.toString();
taskThree["group_id"] = groupThree._id.toString();

taskOne["__v"] = 0;
taskTwo["__v"] = 0;
taskThree["__v"] = 0;
taskFour["__v"] = 0;

const onRedis = async () => {
  await redisClient.connect();
};

const offRedis = async () => {
  await redisClient.quit();
};
const setUpDb = async () => {
  await Task.deleteMany();
  await User.deleteMany();
  await Group.deleteMany();
  await redisClient.flushAll();

  await new User(userOne).save();
  await new User(userTwo).save();

  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
  await new Task(taskFour).save();

  await new Group(groupOne).save();
  await new Group(groupTwo).save();
  await new Group(groupThree).save();

  await redisClient.lPush(userOne._id.toString(), [
    JSON.stringify(taskFour),
    JSON.stringify(taskTwo),
    JSON.stringify(taskOne),
  ]);
  await redisClient.lPush(userTwo._id.toString(), [JSON.stringify(taskThree)]);

  await redisClient.lPush(userOne._id.toString() + ":group", [
    JSON.stringify(groupTwo),
    JSON.stringify(groupOne),
  ]);
  await redisClient.lPush(userTwo._id.toString() + ":group", [
    JSON.stringify(groupThree),
  ]);
};

export default {
  userTwo,
  userOne,
  taskOne,
  taskTwo,
  taskThree,
  taskFour,
  groupOne,
  groupTwo,
  groupThree,
  setUpDb,
  onRedis,
  offRedis,
};
