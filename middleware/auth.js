var connection = require("../koneksi");
var mysql = require("mysql");
var md5 = require("md5");
var response = require("../res"); // Perhatikan path ini, mungkin perlu disesuaikan
var jwt = require("jsonwebtoken");
var config = require("../config/secret");
var ip = require("ip");

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

  var query = "SELECT * FROM ?? WHERE ??=? AND ??=?";
  var table = ["user", "email", post.email, "password", post.password];

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
      var token = jwt.sign({ rows }, config.secret, {
        expiresIn: "1h", // expires in 1 hour
      });

      var id_user = rows[0].id;

      var data = {
        id_user: id_user,
        access_token: token,
        ip: ip.address(),
      };

      var query = "INSERT INTO ?? SET ?";
      var table = ["akses_token"];

      query = mysql.format(query, table);
      connection.query(query, data, function (error, rows, fields) {
        if (error) {
          console.log(error);
          return response.ok(
            { message: "Terjadi kesalahan pada server", error: error.message },
            res
          );
        } else {
          // Menggunakan response.ok dari res.js Anda
          return response.ok(
            {
              message: "Berhasil login",
              token: token,
              user_id: id_user,
            },
            res
          );
        }
      });
    } else {
      response.ok({ message: "Email atau password salah" }, res);
    }
  });
};
