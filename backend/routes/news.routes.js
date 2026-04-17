const express = require("express");
const newsController = require("../controllers/news.controller");

const router = express.Router();

router.get("/", newsController.getNews);
router.get("/countries", newsController.getSupportedCountries);
router.post("/sync", newsController.syncNews);
router.get("/category/:category", newsController.getNewsByCategory);
router.get("/:slug", newsController.getNewsBySlug);

module.exports = router;
