const geoip = require("geoip-lite");
const AdClick = require("../models/AdClick");

function getRequestIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const raw =
    typeof forwarded === "string" && forwarded.trim()
      ? forwarded.split(",")[0].trim()
      : req.socket.remoteAddress || "";

  if (raw === "::1") {
    return "127.0.0.1";
  }

  return raw.replace(/^::ffff:/, "");
}

async function trackAdClick(req, res, next) {
  try {
    const { adId } = req.body || {};

    if (!adId) {
      return res.status(400).json({
        success: false,
        message: "adId is required",
      });
    }

    const ip = getRequestIp(req);
    const userAgent = String(req.headers["user-agent"] || "");
    const geo = geoip.lookup(ip);

    await AdClick.create({
      adId: String(adId),
      ip,
      country: geo?.country || "",
      userAgent,
    });

    return res.status(200).json({
      success: true,
      message: "Ad click tracked",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  trackAdClick,
};
