const jwt = require("jsonwebtoken");
const config = require("../config/secret");

function verifikasi(roles) {
  // Typo: 'fuction' → 'function'
  return function (req, res, next) {
    // Cek authorization header
    var tokenWithBearer = req.headers["authorization"];
    if (tokenWithBearer) {
      var token = tokenWithBearer.split(" ")[1];

      // Verifikasi token
      jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
          return res
            .status(401)
            .send({ auth: false, message: "Token tidak valid!" }); // Kekurangan kurung kurawal
        } else {
          if (roles == 2) {
            req.auth = decoded;
            next();
          } else {
            return res
              .status(401)
              .send({ auth: false, message: "Anda bukan admin!" }); // Kekurangan kurung kurawal
          }
        }
      });
    } else {
      // Ini harusnya berada di luar blok verify
      return res
        .status(401)
        .send({ auth: false, message: "Token tidak ditemukan!" }); // Kekurangan kurung kurawal
    }
  };
}

module.exports = verifikasi;
