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
    "SELECT * FROM menu WHERE id = ?",
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
          // Return the first item directly for consistency
          response.ok(rows[0], res);
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
    // Log the request for debugging
    console.log("[" + new Date().toISOString() + "] POST request to /tambah");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    // Validasi data yang diperlukan
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("Empty request body detected");
      return response.ok({ message: "Data tidak boleh kosong" }, res);
    }

    // Log the actual form data for debugging
    console.log("Form data received:", {
      title: req.body.title,
      price: req.body.price,
      category: req.body.category,
      description1: req.body.description1,
      description2: req.body.description2,
      imageUrl: req.body.imageUrl
    });

    var title = req.body.title;
    var price = req.body.price;
    var category = req.body.category;
    var description1 = req.body.description1;
    var description2 = req.body.description2;
    var imageUrl = req.body.imageUrl;
    
    // Validasi field yang wajib diisi
    if (
      !title ||
      !price ||
      !category ||
      !description1 ||
      !description2 ||
      !imageUrl
    ) {
      console.log("Missing required fields");
      return response.ok(
        {
          message:
            "Semua field wajib diisi (title, price, category, description1, description2, imageUrl)",
        },
        res
      );
    }

    // Insert data ke database - using direct URL instead of filename
    connection.query(
      "INSERT INTO menu (title, price, category, description1, description2, image) VALUES (?, ?, ?, ?, ?, ?)",
      [title, price, category, description1, description2, imageUrl],
      function (error, rows, fields) {
        if (error) {
          console.log(error);
          return response.ok(
            { message: "Gagal menambahkan menu", error: error.message },
            res
          );
        } else {
          return response.ok(
            { message: "Berhasil menambahkan menu baru" },
            res
          );
        }
      }
    );
  } catch (err) {
    console.log(err);
    return response.ok(
      { message: "Terjadi kesalahan pada server", error: err.message },
      res
    );
  }
};

// Update the ubahMenu function to make image optional
exports.ubahMenu = function (req, res) {
  try {
    // Log the request for debugging
    console.log("[" + new Date().toISOString() + "] PUT request to /ubah");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    // Validasi data yang diperlukan
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("Empty request body detected");
      return response.ok({ message: "Data tidak boleh kosong" }, res);
    }

    var id = req.params.id;

    // Validasi ID
    if (!id) {
      return response.ok({ message: "ID menu tidak boleh kosong" }, res);
    }

    // Log the actual form data for debugging
    console.log("Form data received:", {
      title: req.body.title,
      price: req.body.price,
      category: req.body.category,
      description1: req.body.description1,
      description2: req.body.description2,
      imageUrl: req.body.imageUrl
    });

    // Validasi field yang wajib diisi
    var title = req.body.title;
    var price = req.body.price;
    var category = req.body.category;
    var description1 = req.body.description1;
    var description2 = req.body.description2;
    var imageUrl = req.body.imageUrl;

    if (
      !title ||
      !price ||
      !category ||
      !description1 ||
      !description2 ||
      !imageUrl
    ) {
      console.log("Missing required fields");
      return response.ok(
        {
          message:
            "Semua field wajib diisi (title, price, category, description1, description2, imageUrl)",
        },
        res
      );
    }

    // Update data di database - using direct URL instead of filename
    connection.query(
      "UPDATE menu SET title=?, price=?, category=?, description1=?, description2=?, image=? WHERE id=?",
      [title, price, category, description1, description2, imageUrl, id],
      function (error, rows, fields) {
        if (error) {
          console.log(error);
          return response.ok(
            { message: "Gagal mengubah menu", error: error.message },
            res
          );
        } else {
          return response.ok({ message: "Berhasil mengubah menu" }, res);
        }
      }
    );
  } catch (err) {
    console.log(err);
    return response.ok(
      { message: "Terjadi kesalahan pada server", error: err.message },
      res
    );
  }
};

// Helper function to update menu in database
function updateMenuInDatabase(id, title, price, category, description1, description2, image, res) {
  connection.query(
    "UPDATE menu SET title = ?, price = ?, category = ?, description1 = ?, description2 = ?, image = ? WHERE id = ?",
    [title, price, category, description1, description2, image, id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
        return response.ok(
          { message: "Gagal mengubah menu", error: error.message },
          res
        );
      } else {
        return response.ok({ message: "Berhasil mengubah menu" }, res);
      }
    }
  );
}

// Menghapus data berdasarkan id
exports.hapusMenu = function (req, res) {
  try {
    var id = req.params.id;

    // Validasi ID
    if (!id) {
      return response.ok({ message: "ID menu tidak boleh kosong" }, res);
    }

    // Debug: log request body
    console.log("Received DELETE request for ID:", id);

    connection.query(
      "DELETE FROM menu WHERE id = ?",
      [id],
      function (error, rows, fields) {
        if (error) {
          console.log("Database error:", error);
          return response.ok(
            { message: "Gagal menghapus data", error: error.message },
            res
          );
        } else {
          if (rows.affectedRows > 0) {
            return response.ok(
              { message: "Data berhasil dihapus", id: id },
              res
            );
          } else {
            return response.ok(
              { message: "Data menu dengan ID " + id + " tidak ditemukan" },
              res
            );
          }
        }
      }
    );
  } catch (error) {
    console.log("Exception caught:", error);
    return response.ok(
      { message: "Terjadi kesalahan pada server", error: error.message },
      res
    );
  }
};
