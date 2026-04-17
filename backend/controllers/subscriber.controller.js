const { subscribeUser } = require("../services/subscriber.service");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRequestIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded;
  }
  return req.socket.remoteAddress || "";
}

async function subscribe(req, res, next) {
  try {
    const { email, source, preferredCountry } = req.body || {};

    if (!email || !EMAIL_REGEX.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    const ip = getRequestIp(req);
    const result = await subscribeUser({
      email,
      ip,
      source: source || "homepage",
      preferredCountry,
    });

    return res.status(200).json({
      success: true,
      message: result.isNew ? "Subscribed successfully" : "Already subscribed",
      data: {
        email: result.subscriber.email,
        isNew: result.isNew,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  subscribe,
};
