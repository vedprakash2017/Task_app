import * as express from "express";
import User from "../model/user";
import { UserDocument } from "../@types/module";
const route = express.Router();
import auth from "../middleware/auth";
import kafka from "../db/kafka";
// user signup, login and logout
route.post("/user/signup", async (req, res) => {
  let user = req.body;
  try {
    user = new User(user);
    const token = await user.getToken();

    await kafka.producer.sendMessage({data:user , type:'user'});
    // await user.save();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

route.post("/user/login", async (req, res) => {
  try {
    //@ts-ignore
    const user = await User.findByCred(req.body.username, req.body.password);
    const token = await user.getToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

route.get("/user/logout", auth, async (req, res) => {
  try {
    res.locals.user.token = res.locals.user.token.filter((tok:string) => {
      return tok != res.locals.token;
    });

    await kafka.producer.sendMessage({data:res.locals.user , type:'user'});
    // await res.locals.user.save();
    res.send(res.locals.user);
  } catch (e) {
    res.status(400).send();
  }
});

//get current user details
route.get("/user/me", auth, async (req, res) => {
  try {
    // await res.locals.user.populate({path:"groups"})
    // await res.locals.user.populate({path:'tasks'})

    await res.locals.user.populate({ path: "groups" });
    await res.locals.user.populate({ path: "tasks" });

    let user = res.locals.user;
    if (!user) return res.status(500).send();
    const groups = res.locals.user.groups;
    const tasks = res.locals.user.tasks;
    res.send({ user, groups, tasks });
  } catch (e) {
    res.status(400).send();
  }
});

//delete current  user
route.delete("/user/delete", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndRemove({ _id: res.locals.user._id });
    if (!user) res.status(500).send();
    res.send(user);
  } catch (e) {
    res.status(400).send();
  }
});

// get all users list
route.get("/user/all", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (e) {
    console.log(e);
  }
});

//delete all user

route.delete("/user/all", async (req, res) => {
  try {
    await User.deleteMany();
    res.send("All user deleted!");
  } catch (e) {
    res.status(400).send(e);
  }
});
module.exports =  route;
