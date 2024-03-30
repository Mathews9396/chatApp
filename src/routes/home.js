const express = require("express");
const router = express.Router();

// Require controller modules.
const wiki_controller = require("@controllers/home.js");

// Define the routes here
router.get("/", wiki_controller.index);

module.exports = router;
