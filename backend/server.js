require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDb = require("./config/db");
const newsRoutes = require("./routes/news.routes");
const adRoutes = require("./routes/ad.routes");
const subscriberRoutes = require("./routes/subscriber.routes");
const trackVisitor = require("./middleware/trackVisitor");
const startNewsCron = require("./cron/news.cron");
const { COUNTRY_CONFIG } = require("./services/gnews.service");

const app = express();
const port = Number(process.env.PORT) || 5000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use(helmet());
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);
app.use(limiter);
app.use(express.json());
app.use(trackVisitor);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
  });
});

app.get("/api/countries", (_req, res) => {
  const data = Object.keys(COUNTRY_CONFIG).map((code) => ({
    code,
    query: COUNTRY_CONFIG[code].query,
  }));

  res.status(200).json({
    success: true,
    data,
  });
});

app.use("/api/news", newsRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/subscribe", subscriberRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use((error, _req, res, _next) => {
  console.error("[ERROR]", error);
  const statusCode = Number(error.statusCode) || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

async function bootstrap() {
  await connectDb();
  startNewsCron();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
