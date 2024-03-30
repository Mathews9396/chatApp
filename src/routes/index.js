const authRouter = require("./auth");
// const healthCheckRouter = require("./health-check");
const homeRouter = require("./home");
const chatRouter = require("./chats");
// const usersRouter = require("./users");

const run = function (app) {
  app.use("/auth", authRouter);
  // app.use("/health-check", healthCheckRouter);
  app.use("/", homeRouter);
  app.use("/chat", chatRouter);
};

module.exports = run;
