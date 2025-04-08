var connection = require("../koneksi");
var mysql = require("mysql");
var md5 = require("md5");
var response = require("../res");

// Controller untuk registrasi
exports.registrasi = function (req, res) {
  var post = {
    username: req.body.username,
    email: req.body.email,
    password: md5(req.body.password),
    role: parseInt(req.body.role) || 2, // Konversi ke integer, default 2 jika tidak ada
    tanggal_daftar: new Date(),
  };

  var query = "SELECT email FROM ?? WHERE ?? = ?";
  var table = ["user", "email", post.email];

  query = mysql.format(query, table);

  connection.query(query, function (error, rows, fields) {
    if (error) {
      console.log(error);
      return response.ok(
        { message: "Terjadi kesalahan pada server", error: error.message },
        res
      );
    }

    if (rows.length > 0) {
      return response.ok({ message: "Email sudah terdaftar" }, res);
    } else {
      var query = "INSERT INTO ?? SET ?";
      var table = ["user"];

      query = mysql.format(query, table);

      connection.query(query, post, function (error, rows, fields) {
        if (error) {
          console.log(error);
          return response.ok(
            { message: "Terjadi kesalahan pada server", error: error.message },
            res
          );
        } else {
          response.ok({ message: "Berhasil registrasi", data: post }, res);
        }
      });
    }
  });
};

// Controller untuk login
exports.login = function (req, res) {
  var post = {
    password: md5(req.body.password),
    email: req.body.email,
  };

  var query = "SELECT * FROM ?? WHERE ??=?";
  var table = ["user", "email", post.email];

  query = mysql.format(query, table);

  connection.query(query, function (error, rows, fields) {
    if (error) {
      console.log(error);
      return response.ok(
        { message: "Terjadi kesalahan pada server", error: error.message },
        res
      );
    }

    if (rows.length === 0) {
      return response.ok({ message: "Email atau password salah!", success: false }, res);
    }

    // Check if password matches
    if (rows[0].password !== post.password) {
      return response.ok({ message: "Email atau password salah!", success: false }, res);
    }

    // Return user data without token
    return response.ok(
      {
        message: "Login berhasil",
        success: true,
        user_data: {
          id: rows[0].id,
          username: rows[0].username,
          email: rows[0].email,
          role: rows[0].role,
        },
      },
      res
    );
  });
};

var verifikasi = require("./verifikasi");

exports.halamanrahasia = function (req, res) {
  response.ok({ message: "Selamat datang di halaman rahasia" }, res);
};
