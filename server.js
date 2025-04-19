// Di bagian atas file, tambahkan dukungan untuk dotenv
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const path = require('path');
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable CORS - Update this section
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, ngrok-skip-browser-warning");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Remove or update this duplicate CORS middleware
// app.use((req, res, next) => {
//   // Tambahkan header ngrok-skip-browser-warning ke semua response
//   res.setHeader("ngrok-skip-browser-warning", "1");
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization, ngrok-skip-browser-warning"
//   );
//   if (req.method === "OPTIONS") {
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//     return res.status(200).json({});
//   }
//   next();
// });

// Route khusus untuk ngrok testing
app.get("/check-ngrok", (req, res) => {
  res.setHeader("ngrok-skip-browser-warning", "1");
  res.json({
    status: 200,
    message: "Ngrok headers configured correctly",
    headers: req.headers,
  });
});

// Debug middleware
app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    console.log(
      `[${new Date().toISOString()}] ${req.method} request to ${req.originalUrl}`
    );
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
  }
  next();
});

// Root endpoint dengan header ngrok
app.get("/", (req, res) => {
  res.setHeader("ngrok-skip-browser-warning", "1");
  res.json({
    status: 200,
    values: "API is running",
  });
});

// Auth routes
app.use("/auth", require("./middleware"));

// API routes
var routes = require("./routes");
routes(app);

// Custom middleware untuk menambahkan header ke semua response dari routes
app.use((req, res, next) => {
  // Jika response sudah dikirim, tidak perlu melanjutkan
  if (res.headersSent) {
    return next();
  }

  // Tambahkan header ngrok-skip-browser-warning jika belum ada
  if (!res.getHeader("ngrok-skip-browser-warning")) {
    res.setHeader("ngrok-skip-browser-warning", "1");
  }
  next();
});

// Error handlers
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  // Tambahkan header ngrok-skip-browser-warning ke response error
  res.setHeader("ngrok-skip-browser-warning", "1");
  res.status(error.status || 500);
  res.json({
    status: error.status || 500,
    message: error.message,
  });
});

// Vercel serverless function membutuhkan export module.exports = app
// Tetapi untuk development lokal, tetap gunakan app.listen
if (process.env.NODE_ENV !== "production") {
  // Start server untuk development lokal
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API tersedia di: http://localhost:${PORT}`);
    console.log(
      "Ngrok header telah dikonfigurasi untuk menghindari peringatan browser"
    );
  });
}

// Export the app for Vercel serverless functions
module.exports = app;
