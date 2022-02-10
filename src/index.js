const app = require("./app");
const port = process.env.PORT;

app.listen(port, (err, res) => {
  if (err) console.log("Error!");
  else console.log(`Connect to ${port}`);
});
