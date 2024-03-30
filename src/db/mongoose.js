require("dotenv").config();
const mongoose = require("mongoose");

const initializeMongoConn = async function () {
  try {
    const response = await mongoose.connect(process.env.MONGO_DB_CLUSTER_CONN_STRING);
    if (response) console.log(`Connection to database success!`);
  } catch (err) {
    console.log(err);
    console.log(`Error while connecting to database`);
  }
};

module.exports = {
  initializeMongoConn,
};
