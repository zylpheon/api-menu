"use strict";

// Add multer for file uploads
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const express = require('express');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads/images');
    cb(null, uploadDir);
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

module.exports = function (app) {
  var jsonku = require("./controller");

  app.route("/").get(jsonku.index);

  // Menampilkan semua data menu
  app.route("/tampil").get(jsonku.tampilSemuaMenu);

  // Menampilkan data menu berdasarkan id
  app.route("/tampil/:id").get(jsonku.tampilMenuId);

  // Menambahkan data menu - with file upload middleware
  app.route("/tambah").post(upload.single('image'), jsonku.tambahMenu);

  // Mengubah data menu berdasarkan id - with file upload middleware
  app.route("/ubah/:id").put(upload.single('image'), jsonku.ubahMenu);

  // Menghapus data menu berdasarkan id
  app.route("/hapus/:id").delete(jsonku.hapusMenu);
  
  // Serve static files from uploads directory
  app.use('/images', express.static(path.join(__dirname, 'uploads/images')));
};
