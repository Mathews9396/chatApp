const index = function (req, res) {
  res.sendFile(__dirname + "/index.html");
};

module.exports = {
  index,
};
