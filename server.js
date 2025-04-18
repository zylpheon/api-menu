// Di bagian atas file, tambahkan dukungan untuk dotenv
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
const imagesDir = path.join(uploadDir, 'images');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from uploads directory
app.use('/images', express.static(path.join(__dirname, 'uploads/images')));

// CORS middleware dengan tambahan konfigurasi untuk ngrok
app.use((req, res, next) => {
  // Tambahkan header ngrok-skip-browser-warning ke semua response
  res.setHeader("ngrok-skip-browser-warning", "1");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, ngrok-skip-browser-warning"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    return res.status(200).json({});
  }
  next();
});

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

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});
