const mongoose = require("mongoose");

const adClickSchema = new mongoose.Schema(
  {
    adId: {
      type: String,
      required: true,
      index: true,
    },
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
    userAgent: {
      type: String,
      default: "",
    },
    clickedAt: {
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

module.exports = mongoose.model("AdClick", adClickSchema);
