// backend/controller/recommend.js
const express = require("express");
const router = express.Router();
const Profile = require("../model/profile");
const Product = require("../model/product");
const Recommendation = require("../model/recommendation");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated } = require("../middleware/auth");
const { extractColorsFromPath } = require("../services/colorExtractor");
const fs = require("fs");
const path = require("path");

/**
 * Utilities
 */

// Normalize tags into array and lowercase
function normalizeTags(product) {
  if (!product) return [];
  if (Array.isArray(product.tags)) return product.tags.map(t => String(t).toLowerCase());
  if (typeof product.tags === "string") return product.tags.split(",").map(t => t.trim().toLowerCase());
  // fallback to auto tag generation
  return autoGenerateTags(product);
}

// very simple heuristic tag generator from name+description
function autoGenerateTags(product) {
  const text = ((product.name || "") + " " + (product.description || "")).toLowerCase();
  const tags = new Set();
  if (text.match(/jean|denim/)) tags.add("jeans");
  if (text.match(/tshirt|t-shirt|tee|tee-shirt/)) tags.add("tshirt");
  if (text.match(/shirt|blazer|formal/)) tags.add("formal");
  if (text.match(/dress|skirt/)) tags.add("fashion");
  if (text.match(/hoodie|sweat|sweatshirt/)) tags.add("casual");
  if (text.match(/sport|gym|active/)) tags.add("sporty");
  if (text.match(/vintage|retro|classic/)) tags.add("vintage");
  if (text.match(/minimal|simple|clean/)) tags.add("minimalist");
  if (text.match(/color|bright|neon/)) tags.add("bold");
  if (tags.size === 0) tags.add(String(product.category || "casual").toLowerCase());
  return Array.from(tags);
}

// score product relative to profile & options
function scoreProduct(product, profile, options = {}) {
  const p = profile.personalityVector || {};
  const tags = normalizeTags(product);
  let score = 0;

  // Personality rules
  if ((p.extraversion || 0) >= 4 && tags.includes("bold")) score += 6;
  if ((p.openness || 0) >= 4 && (tags.includes("fashion") || tags.includes("trendy"))) score += 5;
  if ((p.conscientiousness || 0) >= 4 && tags.includes("formal")) score += 4;
  if ((p.agreeableness || 0) >= 4 && tags.includes("minimalist")) score += 4;
  if ((p.neuroticism || 0) >= 4 && tags.includes("comfort")) score += 3;

  // Tag boosts from profile tags
  (profile.tags || []).forEach(t => {
    if (tags.includes(String(t).toLowerCase())) score += 3;
  });

  // Seasonal boost
  if (options.season && product.season && product.season.toLowerCase() === options.season.toLowerCase()) {
    score += 3;
  }

  // Price tier boost
  if (options.priceTier) {
    const price = Number(product.discountPrice || product.originalPrice || 0);
    if (options.priceTier === "budget" && price <= 1000) score += 2;
    if (options.priceTier === "medium" && price > 1000 && price <= 4000) score += 2;
    if (options.priceTier === "premium" && price > 4000) score += 2;
  }

  // color mood (if provided in options.mood): small boost
  if (options.mood && product.colors && product.colors.length) {
    const lower = product.colors.map(c => c.replace("#", "").toLowerCase());
    if (options.mood === "bright" && lower.some(hex => isBrightHex(hex))) score += 2;
    if (options.mood === "calm" && lower.some(hex => isCalmHex(hex))) score += 2;
  }

  // fallback small score to order by recency if all zero
  return score + (product.basePopularity || 0);
}

function isBrightHex(hex) {
  if (!hex) return false;
  const r = parseInt(hex.substring(0,2),16);
  const g = parseInt(hex.substring(2,4),16);
  const b = parseInt(hex.substring(4,6),16);
  const brightness = (r*299 + g*587 + b*114)/1000;
  return brightness > 200;
}
function isCalmHex(hex) {
  if (!hex) return false;
  const r = parseInt(hex.substring(0,2),16);
  const g = parseInt(hex.substring(2,4),16);
  const b = parseInt(hex.substring(4,6),16);
  const brightness = (r*299 + g*587 + b*114)/1000;
  return brightness > 120 && brightness <= 200;
}

// build outfit combos (simple greedy)
function buildOutfits(products, profile, maxCombos = 10) {
  // categorize by subCategory/type (you must have these or rely on tags)
  const tops = products.filter(p => (p.subCategory || "").toLowerCase().includes("top") || normalizeTags(p).includes("tshirt") || normalizeTags(p).includes("shirt") || normalizeTags(p).includes("hoodie"));
  const bottoms = products.filter(p => (p.subCategory || "").toLowerCase().includes("bottom") || normalizeTags(p).includes("jeans") || normalizeTags(p).includes("pants") || normalizeTags(p).includes("trouser"));
  const shoes = products.filter(p => (p.subCategory || "").toLowerCase().includes("shoe") || (p.category || "").toLowerCase().includes("shoe") || normalizeTags(p).includes("shoe"));
  const accessories = products.filter(p => normalizeTags(p).includes("accessory") || (p.subCategory || "").toLowerCase().includes("accessory") || normalizeTags(p).includes("belt") || normalizeTags(p).includes("watch"));

  // if any category empty, fallback to top/others
  const combos = [];
  for (let t of tops) {
    for (let b of bottoms) {
      for (let s of (shoes.length ? shoes : [null])) {
        for (let a of (accessories.length ? accessories : [null])) {
          const score = (scoreProduct(t, profile) + scoreProduct(b, profile) + (s?scoreProduct(s, profile):0) + (a?scoreProduct(a, profile):0)) / (s && a ? 4 : 2);
          combos.push({
            items: [t, b].concat(s? [s]:[]).concat(a? [a]:[]),
            score,
            reason: "Outfit assembled for your style"
          });
        }
      }
    }
  }

  combos.sort((x,y)=> y.score - x.score);
  return combos.slice(0, Math.min(maxCombos, combos.length));
}

/**
 * End utilities
 */

/* ROUTES */

// basic generate — personality+tags (compat)
router.post("/generate",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(400).json({ success:false, message: "No profile. Take the quiz." });

    const allProducts = await Product.find({}).lean().limit(500); // cap
    const scored = allProducts.map(p => ({ product: p, score: scoreProduct(p, profile, req.body.options || {}) }));
    const top = scored.sort((a,b)=> b.score - a.score).slice(0, 20);
    const items = top.map(t => ({ productId: t.product._id, score: t.score, reason: "Personality + tags match" }));

    const rec = await Recommendation.create({ userId: req.user._id, items });
    return res.json({ success:true, recommendations: rec });
  })
);

// regenerate with options (season, mood, priceTier)
router.post("/regenerate",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const { season, mood, priceTier } = req.body; // optional
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(400).json({ success:false, message: "No profile. Take the quiz." });

    const options = { season, mood, priceTier };
    const allProducts = await Product.find({}).lean().limit(1000);
    const scored = allProducts.map(p => ({ product: p, score: scoreProduct(p, profile, options) }));
    const top = scored.sort((a,b)=> b.score - a.score).slice(0, 30);
    const items = top.map(t => ({ productId: t.product._id, score: t.score, reason: `Matched with options ${JSON.stringify(options)}` }));

    const rec = await Recommendation.create({ userId: req.user._id, items });
    return res.json({ success:true, recommendations: rec });
  })
);

// outfit combos
router.post("/outfit",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(400).json({ success:false, message: "No profile" });

    const products = await Product.find({}).lean().limit(500);
    const combos = buildOutfits(products, profile, 12);

    // save not as Recommendation but as separate record or as items — here we save a recommendation of combos (items store arrays)
    const items = combos.map(c => ({
      productId: c.items.map(it => it._id),
      score: c.score,
      reason: c.reason
    }));

    const rec = await Recommendation.create({ userId: req.user._id, items });
    return res.json({ success:true, combos, recommendations: rec });
  })
);

// mood/color-based (image or palette)
router.post("/mood",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    // Option 1: send an uploaded image file (multipart) - if you want this, wire multer in router
    // Option 2: client passes { imagePath } pointing to a server-URL already uploaded or product image URL
    const { imagePath, useLatestProfile } = req.body;

    let mood = null;
    if (imagePath) {
      // imagePath must be a server-accessible path or buffer
      try {
        const { palette, moods } = await extractColorsFromPath(path.isAbsolute(imagePath) ? imagePath : path.join(process.cwd(), imagePath));
        // pick dominant mood
        mood = moods[0] || null;
      } catch (err) {
        console.warn("mood extraction failed:", err);
      }
    }

    // fallback to deriving mood from profile (extraversion -> bright, conscientiousness -> calm)
    if (!mood && useLatestProfile) {
      const profile = await Profile.findOne({ userId: req.user._id });
      if (profile) {
        const p = profile.personalityVector || {};
        if ((p.extraversion||0) >= 4) mood = "bright";
        else if ((p.conscientiousness||0) >= 4) mood = "calm";
        else mood = "muted";
      }
    }

    // now score using mood
    const allProducts = await Product.find({}).lean().limit(500);
    const userProfile = await Profile.findOne({ userId: req.user._id }) || {};

    const scored = allProducts.map(p => ({
        product: p,
        score: scoreProduct(p, userProfile, { mood }),
    }));
    const top = scored.sort((a,b)=> b.score - a.score).slice(0, 20);
    const items = top.map(t => ({ productId: t.product._id, score: t.score, reason: `Mood-based (${mood})` }));

    const rec = await Recommendation.create({ userId: req.user._id, items });
    return res.json({ success: true, mood, recommendations: rec });
  })
);

// seasonal recommendations
router.post("/seasonal",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const { season } = req.body; // e.g. "summer","winter","monsoon"
    if (!season) return res.status(400).json({ success:false, message: "season required" });

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(400).json({ success:false, message: "no profile" });

    const allProducts = await Product.find({}).lean().limit(1000);
    const options = { season };
    const scored = allProducts.map(p => ({ product: p, score: scoreProduct(p, profile, options) }));
    const top = scored.sort((a,b) => b.score - a.score).slice(0, 30);
    const items = top.map(t => ({ productId: t.product._id, score: t.score, reason: `Season: ${season}` }));

    const rec = await Recommendation.create({ userId: req.user._id, items });
    res.json({ success:true, recommendations: rec });
  })
);

// price-tier recommendations
router.post("/price",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const { tier } = req.body; // "budget"|"medium"|"premium"
    if (!tier) return res.status(400).json({ success:false, message: "tier required" });

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(400).json({ success:false, message: "no profile" });

    const allProducts = await Product.find({}).lean().limit(1000);
    const options = { priceTier: tier };
    const scored = allProducts.map(p => ({ product: p, score: scoreProduct(p, profile, options) }));
    const top = scored.sort((a,b)=> b.score - a.score).slice(0, 30);
    const items = top.map(t => ({ productId: t.product._id, score: t.score, reason: `Price tier: ${tier}` }));

    const rec = await Recommendation.create({ userId: req.user._id, items });
    res.json({ success:true, recommendations: rec });
  })
);

// latest (existing)
router.get("/latest",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const rec = await Recommendation.findOne({ userId: req.user._id }).sort({ createdAt:-1 }).populate("items.productId");
    if (!rec) return res.json({ success:true, recommendations: null });
    return res.json({ success:true, recommendations: rec });
  })
);

module.exports = router;
