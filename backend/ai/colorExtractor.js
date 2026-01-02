const getColors = require("get-image-colors");
const fileType = require("file-type");

async function extractPalette(buffer) {
  try {
    const type = await fileType.fromBuffer(buffer);
    const mime = type ? type.mime : "image/jpeg";

    const colors = await getColors(buffer, mime);
    return colors.map(c => c.hex());
  } catch (err) {
    console.log("Palette error:", err.message);
    return [];
  }
}

module.exports = { extractPalette };
