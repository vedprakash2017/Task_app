const { onRedis, offRedis } = require("./extra/db");

beforeAll(onRedis);
afterAll(offRedis);
require("./user.test");
require("./task.test");
require("./group.test");
