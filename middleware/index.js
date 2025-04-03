var express = require("express");
var auth = require("./auth");
var router = express.Router();

// Daftarkan menu registrasi route
router.post("/api/v1/register", auth.registrasi);

// Daftarkan menu login route
router.post("/api/v1/login", auth.login);

module.exports = router;
