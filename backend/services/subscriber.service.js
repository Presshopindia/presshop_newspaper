const geoip = require("geoip-lite");
const Subscriber = require("../models/Subscriber");

function cleanIp(ip = "") {
  const first = String(ip).split(",")[0].trim();
  if (first === "::1") {
    return "127.0.0.1";
  }
  return first.replace(/^::ffff:/, "");
}

async function subscribeUser({ email, ip, source, preferredCountry }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedIp = cleanIp(ip);

  const existing = await Subscriber.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    return { subscriber: existing, isNew: false };
  }

  const geo = geoip.lookup(normalizedIp);
  const latitude = geo?.ll?.[0] ?? null;
  const longitude = geo?.ll?.[1] ?? null;

  const created = await Subscriber.create({
    email: normalizedEmail,
    source: source || "unknown",
    preferredCountry: preferredCountry
      ? String(preferredCountry).toLowerCase().trim()
      : "",
    ip: normalizedIp,
    country: geo?.country || "",
    region: geo?.region || "",
    city: geo?.city || "",
    latitude,
    longitude,
  });

  return { subscriber: created.toObject(), isNew: true };
}

module.exports = {
  subscribeUser,
};
