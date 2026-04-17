const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      default: "",
      index: true,
    },
    country: {
      type: String,
      default: "",
      index: true,
    },
    city: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    path: {
      type: String,
      default: "",
      index: true,
    },
    referrer: {
      type: String,
      default: "",
    },
    device: {
      type: String,
      enum: ["mobile", "desktop"],
      default: "desktop",
    },
    visitedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Visitor", visitorSchema);
