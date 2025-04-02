"use strict";

var response = require("./res");
var connection = require("./koneksi");

exports.index = function (req, res) {
  response.ok("API is running", res);
};

// Menampilkan semua data menu
exports.tampilSemuaMenu = function (req, res) {
  connection.query("SELECT * FROM menu", function (error, rows, fields) {
    if (error) {
      console.log(error);
    } else {
      response.ok(rows, res);
    }
  });
};
