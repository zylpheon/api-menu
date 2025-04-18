var express = require("express");
var auth = require("./auth");
var verifikasi = require("./verifikasi");
var router = express.Router();

// Daftarkan menu registrasi route
router.post("/api/v1/register", auth.registrasi);

// Daftarkan menu login route
router.post("/api/v1/login", auth.login);

// Alamat yang perlu otorisasi
router.get("/api/v1/rahasia", verifikasi('admin'), auth.halamanrahasia);

module.exports = router;
