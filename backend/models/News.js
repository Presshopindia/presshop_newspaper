const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "politics",
      lowercase: true,
      trim: true,
    },
    country: {
      type: String,
      default: "gb",
      lowercase: true,
      trim: true,
      index: true,
    },
    language: {
      type: String,
      default: "en",
      lowercase: true,
      trim: true,
    },
    source: {
      type: String,
      default: "GNews",
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: "",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

newsSchema.index({ slug: 1 }, { unique: true });
newsSchema.index({ title: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ country: 1, category: 1, publishedAt: -1 });

module.exports = mongoose.model("News", newsSchema);
