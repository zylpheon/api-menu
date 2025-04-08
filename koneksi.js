var mysql = require("mysql");

// Konfigurasi database berdasarkan environment
const dbConfig =
  process.env.NODE_ENV === "production"
    ? {
        // Konfigurasi untuk production (database cloud)
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "api-menu",
        // Tambahan untuk beberapa penyedia MySQL cloud yang membutuhkan SSL
        ssl:
          process.env.DB_SSL === "true"
            ? { rejectUnauthorized: false }
            : undefined,
      }
    : {
        // Konfigurasi untuk development (database lokal)
        host: "localhost",
        user: "root",
        password: "",
        database: "api-menu",
      };

// Buat koneksi ke database MySQL
const conn = mysql.createConnection(dbConfig);

// Koneksi ke database
conn.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database as ID " + conn.threadId);
});

module.exports = conn;
