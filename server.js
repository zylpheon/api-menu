const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    return res.status(200).json({});
  }
  next();
});

// Debug middleware
app.use((req, res, next) => {
  if (req.method === "POST") {
    console.log(
      `[${new Date().toISOString()}] POST request to ${req.originalUrl}`
    );
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
  }
  next();
});

// Auth routes
app.use("/auth", require("./middleware"));

// API routes
var routes = require("./routes");
routes(app);

// Error handlers
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    status: error.status || 500,
    message: error.message,
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
