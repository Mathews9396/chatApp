require("dotenv").config();
require("module-alias/register"); // added alias

const express = require("express");
const app = express();

const morgan = require("morgan");
const logger = require("@utils/logger");
const http = require("http");
const appServer = http.createServer(app);
const { Server } = require("socket.io");
const { initializeMongoConn } = require("@db/mongoose");
const { socketConnection } = require("@sockets/connection");
const cors = require("cors");

initializeMongoConn();

appServer.listen(process.env.BACKEND_PORT, () => {
  console.log("chat app listening on *:", process.env.BACKEND_PORT);
});
app.use(express.json());
app.use(
  morgan(":method :url TIME=:response-time ms HEADERS=:req[header] IP= :remote-addr ", {
    stream: { write: (message) => logger.http(message) },
    skip: function (req, res) {
      return req.url === "/liveness";
    },
  })
);
app.use(cors());

const io = new Server(appServer, {
  cors: {
    origin: `${process.env.BACKEND_SCHEME}://${process.env.BACKEND_URL}:${process.env.BACKEND_PORT}`,
  },
});
console.log("socket payload limit, maxHttpBufferSize - ", io.engine.opts.maxHttpBufferSize / 1000000, "MB");

let appSocket;
io.on("connection", function (socket) {
  appSocket = socket;
  socketConnection(socket);
});

//loading the routers
const run = require("@routes/index");
run(app); // function in routes/index.js

module.exports = app;
