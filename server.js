const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Middleware untuk menangani CORS
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

// Middleware untuk debugging request
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

// Import routes
var routes = require("./routes");
routes(app);

// Middleware untuk menangani URL yang tidak ada
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    status: error.status || 500,
    message: error.message,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
