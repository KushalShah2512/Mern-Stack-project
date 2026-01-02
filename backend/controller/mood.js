const express = require("express");
const router = express.Router();
const fs = require("fs");
const upload = require("../multer");
const { isAuthenticated } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { extractPalette } = require("../ai/colorExtractor");
const { averageBrightness } = require("../ai/brightness");
const { computeMood, moodToCategory } = require("../ai/moodLogic");
const { createMoodRecommendations } = require("../ai/moodRecommendEngine");

// Extract palette from local file path
async function extractColorsFromPath(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const palette = await extractPalette(buffer);
    const brightness = averageBrightness(palette);
    const mood = computeMood(brightness);

    return { palette, brightness, mood };
  } catch (err) {
    console.log("❌ extractColorsFromPath ERROR:", err);
    return { palette: [], brightness: 0, mood: "neutral" };
  }
}

router.post(
  "/analyze",
  upload.single("image"),
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {

    console.log("🔥 Mood route HIT");

    if (!req.file) {
      console.log("❌ No file received!");
      return res.status(400).json({ success: false, message: "No file received" });
    }

    console.log("📸 File received:", req.file.path);

    const filePath = req.file.path;

    // 1) Extract palette + mood
    const { palette, brightness, mood } = await extractColorsFromPath(filePath);

    console.log("🎨 Palette:", palette);
    console.log("💡 Brightness:", brightness);
    console.log("😎 Mood:", mood);

    // 2) Convert mood to category
    const preferredCategory = moodToCategory[mood] || "Casual";

    console.log("👕 Category:", preferredCategory);

    // 3) Build recommendations
    const recommendations = await createMoodRecommendations(
      req.user._id,
      preferredCategory,
      palette
    );

    return res.json({
      success: true,
      palette,
      brightness,
      mood,
      preferredCategory,
      recommendations
    });
  })
);

module.exports = router;
