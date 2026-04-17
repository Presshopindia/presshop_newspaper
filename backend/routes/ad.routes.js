const express = require("express");
const Ad = require("../models/Ad");
const { trackAdClick } = require("../controllers/ad.controller");

const router = express.Router();

router.post("/click", trackAdClick);

function resolveAdCountry(req) {
  const fromHeader = req.headers["x-country"];
  const fromQuery = req.query.country;
  const value = String(fromHeader || fromQuery || "").toLowerCase().trim();
  return value || "global";
}

router.get("/", async (req, res, next) => {
  try {
    const userCountry = resolveAdCountry(req);
    const countryFilter =
      userCountry === "global"
        ? { country: "global" }
        : { $or: [{ country: "global" }, { country: userCountry }] };

    const ads = await Ad.find({ isActive: true, ...countryFilter })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: ads.map((ad) => {
        const imageSrc = ad.image || ad.imageUrl || "";

        return {
          id: String(ad._id),
          title: ad.title,
          imageUrl: imageSrc,
          image: imageSrc,
          link: ad.link,
          type: ad.type,
          key: ad.key,
          country: ad.country || "global",
        };
      }),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
