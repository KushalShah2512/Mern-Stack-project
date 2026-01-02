const getColors = require("get-image-colors");

/**
 * extractColorsFromPath
 */
async function extractColorsFromPath(imagePath) {
  try {
    const colors = await getColors(imagePath);

    // Extract hex codes
    const palette = colors.map((color) => color.hex());

    // simple mood detection based on brightness
    const moods = colors.map((color) => {
      const [r, g, b] = color.rgb();
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;

      if (brightness > 200) return "bright";
      if (brightness > 120) return "calm";
      return "muted";
    });

    return { palette, moods };
  } catch (err) {
    console.error("Color extraction error:", err);
    return { palette: [], moods: [] };
  }
}

module.exports = { extractColorsFromPath };
