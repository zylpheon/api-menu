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
      response.ok(
        { message: "Terjadi kesalahan pada server", error: error.message },
        res
      );
    } else {
      response.ok(rows, res);
    }
  });
};

// Menampilkan data menu berdasarkan id
exports.tampilMenuId = function (req, res) {
  var id = req.params.id;
  connection.query(
    "SELECT * FROM menu WHERE id_menu = ?",
    [id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
        response.ok(
          { message: "Terjadi kesalahan pada server", error: error.message },
          res
        );
      } else {
        if (rows.length > 0) {
          response.ok(rows, res);
        } else {
          response.ok({ message: "Data menu tidak ditemukan" }, res);
        }
      }
    }
  );
};

// Menambahkan data menu
exports.tambahMenu = function (req, res) {
  try {
    // Validasi data yang diperlukan
    if (!req.body) {
      return response.ok({ message: "Data tidak boleh kosong" }, res);
    }

    var title = req.body.title;
    var price = req.body.price;
    var category = req.body.category;

    // Validasi field yang wajib diisi
    if (!title || !price || !category) {
      return response.ok(
        { message: "Field title, price, dan category wajib diisi" },
        res
      );
    }

    var description1 = req.body.description1 || null;
    var description2 = req.body.description2 || null;
    var image = req.body.image || null;

    // Debug: log request body
    console.log("Received POST data:", req.body);

    connection.query(
      "INSERT INTO menu (title, description1, description2, price, category, image) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description1, description2, price, category, image],
      function (error, rows, fields) {
        if (error) {
          console.log("Database error:", error);
          response.ok(
            { message: "Gagal menambahkan data", error: error.message },
            res
          );
        } else {
          response.ok(
            {
              message: "Data berhasil ditambahkan",
              data: {
                id: rows.insertId,
                title: title,
                price: price,
                category: category,
              },
            },
            res
          );
        }
      }
    );
  } catch (error) {
    console.log("Exception caught:", error);
    response.ok(
      { message: "Terjadi kesalahan pada server", error: error.message },
      res
    );
  }
};
