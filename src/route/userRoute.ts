import express from "express";
import User from "../model/user";
import route = express.Router();
import auth from "../middleware/auth";

// user signup, login and logout
route.post("/user/signup", async (req, res) => {
  let user = req.body;
  try {
    user = new User(user);
    const token = await user.getToken();
    await user.save();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

route.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCred(req.body.username, req.body.password);
    const token = await user.getToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

route.get("/user/logout", auth, async (req, res) => {
  try {
    req.user.token = req.user.token.filter((tok) => {
      return tok != req.token;
    });
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send();
  }
});

//get current user details
route.get("/user/me", auth, async (req, res) => {
  try {
    // await req.user.populate({path:"groups"})
    // await req.user.populate({path:'tasks'})

    await req.user.populate({ path: "groups" });
    await req.user.populate({ path: "tasks" });

    let user = req.user;
    if (!user) return res.status(500).send();
    const groups = req.user.groups;
    const tasks = req.user.tasks;
    res.send({ user, groups, tasks });
  } catch (e) {
    res.status(400).send();
  }
});

//delete current  user
route.delete("/user/delete", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndRemove({ _id: req.user._id });
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
export default route;
