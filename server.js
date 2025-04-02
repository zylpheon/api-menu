const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Parse application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Import routes
var routes = require("./router");
routes(app);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
