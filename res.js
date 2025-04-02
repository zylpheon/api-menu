"use strict";

exports.ok = function (values, res) {
  var data = {
    status: true,
    values: values,
  };
  res.json(data);
  res.end();
};
