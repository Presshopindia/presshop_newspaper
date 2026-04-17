const geoip = require("geoip-lite");
const Visitor = require("../models/Visitor");

const VISITOR_DEDUPE_WINDOW_MS =
  Number(process.env.VISITOR_DEDUPE_WINDOW_MS) || 5 * 60 * 1000;
const VISITOR_CACHE_MAX_SIZE = 20000;
const visitorSessionCache = new Map();

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

function detectDevice(userAgent = "") {
  return /mobile|android|iphone|ipad|ipod/i.test(userAgent)
    ? "mobile"
    : "desktop";
}

function getSessionKey(ip, userAgent, path) {
  const normalizedPath = String(path || "/").split("?")[0];
  return `${ip}|${userAgent}|${normalizedPath}`;
}

function pruneVisitorCache(now) {
  for (const [key, lastSeenAt] of visitorSessionCache.entries()) {
    if (now - lastSeenAt > VISITOR_DEDUPE_WINDOW_MS) {
      visitorSessionCache.delete(key);
    }
  }
}

function shouldSkipTracking(sessionKey, now) {
  const lastSeenAt = visitorSessionCache.get(sessionKey);
  if (lastSeenAt && now - lastSeenAt < VISITOR_DEDUPE_WINDOW_MS) {
    return true;
  }

  visitorSessionCache.set(sessionKey, now);

  if (visitorSessionCache.size > VISITOR_CACHE_MAX_SIZE) {
    pruneVisitorCache(now);
  }

  return false;
}

function trackVisitor(req, _res, next) {
  if (req.method !== "GET") {
    return next();
  }

  const path = req.originalUrl || "";
  if (
    path.startsWith("/api/") ||
    path.startsWith("/_next/") ||
    path === "/favicon.ico"
  ) {
    return next();
  }

  const ip = getRequestIp(req);
  const userAgent = req.headers["user-agent"] || "";
  const referrer = req.headers.referer || "";
  const now = Date.now();
  const sessionKey = getSessionKey(ip, String(userAgent), path);

  if (shouldSkipTracking(sessionKey, now)) {
    return next();
  }

  const geo = geoip.lookup(ip);

  const payload = {
    ip,
    country: geo?.country || "",
    city: geo?.city || "",
    userAgent: String(userAgent),
    path,
    referrer: String(referrer),
    device: detectDevice(String(userAgent)),
  };

  setImmediate(() => {
    Visitor.create(payload).catch((error) => {
      console.warn("[TRACK] Failed to store visitor:", error.message);
    });
  });

  return next();
}

module.exports = trackVisitor;
