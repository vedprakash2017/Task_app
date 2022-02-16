import * as express from "express";

const app = express();
require("./db/mongo");
require("./db/redis-db");
app.use(express.static("./public"));
app.use(express.json());

const taskRoute = require("./route/taskRoute");
const userRoute = require("./route/userRoute");
const groupRoute = require("./route/groupRoute");

app.use(taskRoute);
app.use(groupRoute);
app.use(userRoute);

export default app;
