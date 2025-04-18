"use strict";

const express = require('express');

module.exports = function (app) {
  var jsonku = require("./controller");

  app.route("/").get(jsonku.index);

  // Menampilkan semua data menu
  app.route("/tampil").get(jsonku.tampilSemuaMenu);

  // Menampilkan data menu berdasarkan id
  app.route("/tampil/:id").get(jsonku.tampilMenuId);

  // Menambahkan data menu - URL only
  app.route("/tambah").post(jsonku.tambahMenu);

  // Mengubah data menu berdasarkan id - URL only
  app.route("/ubah/:id").put(jsonku.ubahMenu);

  // Menghapus data menu berdasarkan id
  app.route("/hapus/:id").delete(jsonku.hapusMenu);
};
