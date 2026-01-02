const Product = require("../model/product");
const Recommendation = require("../model/recommendation");
const Profile = require("../model/profile");
const namer = require("color-namer");

// Convert HEX → RGB
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substr(0, 2), 16),
    g: parseInt(h.substr(2, 2), 16),
    b: parseInt(h.substr(4, 2), 16),
  };
}

// Compute color similarity score
function colorSimilarityScore(productColor, palette) {
  if (!productColor || palette.length === 0) return 0;

  let best = 0;

  const prod = hexToRgb(productColor);

  palette.forEach((hex) => {
    const p = hexToRgb(hex);

    const dist =
      Math.abs(prod.r - p.r) +
      Math.abs(prod.g - p.g) +
      Math.abs(prod.b - p.b);

    const score = 255 * 3 - dist; // inverse distance
    if (score > best) best = score;
  });

  return best / 100; // normalize
}

// Compute personality score
function personalityScore(product, profile) {
  if (!product.tags || !profile.tags) return 0;

  let score = 0;

  product.tags.forEach((t) => {
    if (profile.tags.includes(t)) score += 10;
  });

  return score;
}

// Compute mood score
function moodScore(category, preferredCategory) {
  return category.toLowerCase().includes(preferredCategory.toLowerCase())
    ? 40
    : 0;
}

async function createMoodRecommendations(userId, preferredCategory, palette = []) {
  const profile = await Profile.findOne({ userId });

  const products = await Product.find().limit(200);

  const scored = products.map((p) => {
    // Extract product dominant colors (optional)
    const productColor = p?.color || null;

    let final =
      moodScore(p.category, preferredCategory) +
      personalityScore(p, profile || {}) +
      colorSimilarityScore(productColor, palette);

    return {
      productId: p._id,
      score: final,
      reason: "Hybrid mood+personality+color scoring",
    };
  });

  const sorted = scored.sort((a, b) => b.score - a.score).slice(0, 15);

  const rec = await Recommendation.create({
    userId,
    items: sorted,
  });

  return rec;
}

module.exports = { createMoodRecommendations };
