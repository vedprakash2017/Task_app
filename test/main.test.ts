import db from "./extra/db";

beforeAll(db.onRedis);
afterAll(db.offRedis);
require("./user.test");
require("./task.test");
require("./group.test");
