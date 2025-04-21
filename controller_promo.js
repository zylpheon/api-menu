"use strict";

var response = require("./res");
var connection = require("./koneksi");

// Get all promos
exports.getPromos = function (req, res) {
  connection.query(
    "SELECT * FROM promo ORDER BY id DESC",
    function (error, rows, fields) {
      if (error) {
        console.log(error);
        return response.error(error, res);
      }

      return response.ok(rows, res);
    }
  );
};

// Get a single promo by ID
exports.getPromoById = function (req, res) {
  const id = req.params.id;

  connection.query(
    "SELECT * FROM promo WHERE id = ?",
    [id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
        return response.error(error, res);
      }

      if (rows.length === 0) {
        return response.ok({ message: "Promo tidak ditemukan" }, res);
      }

      return response.ok(rows[0], res);
    }
  );
};

// Add a new promo
exports.addPromo = function (req, res) {
  try {
    // Log the request for debugging
    console.log("[" + new Date().toISOString() + "] POST request to /promo");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    // Validate required data
    if (!req.body || Object.keys(req.body).length === 0) {
      return response.ok({ message: "Data tidak boleh kosong" }, res);
    }

    const { title, description, time_start, time_end, image } = req.body;

    // Log extracted fields for debugging
    console.log("Extracted fields:", { title, description, time_start, time_end, image });

    // Check each field individually and provide specific error messages
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!description) missingFields.push("description");
    if (!time_start) missingFields.push("time_start");
    if (!time_end) missingFields.push("time_end");
    if (!image) missingFields.push("image");
    
    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      return response.ok({ 
        message: `Semua field harus diisi. Missing: ${missingFields.join(", ")}`,
        missingFields: missingFields
      }, res);
    }

    // Create promo object
    const promoData = {
      title,
      description,
      time_start,
      time_end,
      image,
      created_at: new Date(),
    };

    // Insert into database
    connection.query(
      "INSERT INTO promo SET ?",
      promoData,
      function (error, rows, fields) {
        if (error) {
          console.log(error);
          return response.error(error, res);
        }

        return response.ok(
          {
            id: rows.insertId,
            ...promoData,
            message: "Promo berhasil ditambahkan",
          },
          res
        );
      }
    );
  } catch (error) {
    console.log(error);
    return response.error(error, res);
  }
};

// Update an existing promo
exports.updatePromo = function (req, res) {
  try {
    // Log the request for debugging
    console.log("[" + new Date().toISOString() + "] PUT request to /promo");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    const id = req.params.id;

    // Validate required data
    if (!req.body || Object.keys(req.body).length === 0) {
      return response.ok({ message: "Data tidak boleh kosong" }, res);
    }

    const { title, description, time_start, time_end, image } = req.body;

    // Log extracted fields for debugging
    console.log("Extracted fields:", { title, description, time_start, time_end, image });

    if (!title || !description || !time_start || !time_end || !image) {
      const missingFields = [];
      if (!title) missingFields.push("title");
      if (!description) missingFields.push("description");
      if (!time_start) missingFields.push("time_start");
      if (!time_end) missingFields.push("time_end");
      if (!image) missingFields.push("image");
      
      console.log("Missing fields:", missingFields);
      return response.ok({ message: `Semua field harus diisi. Missing: ${missingFields.join(", ")}` }, res);
    }

    // Update promo in database
    connection.query(
      "UPDATE promo SET title = ?, description = ?, time_start = ?, time_end = ?, image = ?, updated_at = NOW() WHERE id = ?",
      [title, description, time_start, time_end, image, id],
      function (error, rows, fields) {
        if (error) {
          console.log(error);
          return response.error(error, res);
        }

        if (rows.affectedRows === 0) {
          return response.ok({ message: "Promo tidak ditemukan" }, res);
        }

        return response.ok(
          {
            id,
            title,
            description,
            time_start,
            time_end,
            image,
            message: "Promo berhasil diubah",
          },
          res
        );
      }
    );
  } catch (error) {
    console.log(error);
    return response.error(error, res);
  }
};

// Delete a promo
exports.deletePromo = function (req, res) {
  try {
    const id = req.params.id;

    connection.query(
      "DELETE FROM promo WHERE id = ?",
      [id],
      function (error, rows, fields) {
        if (error) {
          console.log(error);
          return response.error(error, res);
        }

        if (rows.affectedRows === 0) {
          return response.ok({ message: "Promo tidak ditemukan" }, res);
        }

        return response.ok({ message: "Promo berhasil dihapus", id }, res);
      }
    );
  } catch (error) {
    console.log(error);
    return response.error(error, res);
  }
};

// Get active promos (current date is between time_start and time_end)
exports.getActivePromos = function (req, res) {
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  connection.query(
    "SELECT * FROM promo WHERE time_start <= ? AND time_end >= ? ORDER BY time_start ASC",
    [currentDate, currentDate],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
        return response.error(error, res);
      }

      return response.ok(rows, res);
    }
  );
};
