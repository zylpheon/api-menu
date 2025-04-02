"use strict";

exports.ok = function (values, res) {
  var data = {
    status: 200,
    values: values,
  };
  res.status(200).json(data);
};

exports.error = function (error, res, statusCode = 500) {
  var data = {
    status: statusCode,
    message: error.message || "Internal Server Error",
  };
  res.status(statusCode).json(data);
};
