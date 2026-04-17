const express = require("express");
const subscriberController = require("../controllers/subscriber.controller");

const router = express.Router();

router.post("/", subscriberController.subscribe);

module.exports = router;
