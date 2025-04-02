var mysql = require("mysql");

// Buat koneksi ke database MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "api-menu",
});

// Koneksi ke database
conn.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database as ID " + conn.threadId);
});

module.exports = conn;
