var express = require("express");
var auth = require("./auth");
var router = express.Router();

// Daftarkan menu registrasi route
router.post("/api/v1/register", auth.registrasi);

// Daftarkan menu login route
router.post("/api/v1/login", auth.login);

module.exports = router;

var verifikasi = require("./verifikasi"); // Impor module verifikasi

// Alamat yang perlu otorisasi
router.get("/api/v1/rahasia", verifikasi(2), auth.halamanrahasia); // Gunakan module 'verifikasi', bukan 'auth.verifikasi'

module.exports = router;
