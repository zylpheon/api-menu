"use strict";

module.exports = function (app) {
  var jsonku = require("./controller");

  app.route("/").get(jsonku.index);

  // Menampilkan semua data menu
  app.route("/tampil").get(jsonku.tampilSemuaMenu);
};
