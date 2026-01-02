exports.averageBrightness = (palette) => {
  let sum = 0;
  palette.forEach(hex => {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    sum += (r + g + b) / 3;
  });
  return sum / palette.length;
};

exports.computeHybridMood = ({ palette, brightness, emotion }) => {
  if (emotion === "happy") return "joyful";
  if (emotion === "sad") return "melancholic";
  if (emotion === "angry") return "intense";

  if (brightness > 180) return "vibrant";
  if (brightness > 120) return "calm";
  return "moody";
};

exports.moodToCategory = {
  joyful: "Trendy",
  melancholic: "Comfort",
  vibrant: "Casual",
  moody: "Minimalist",
  intense: "Streetwear",
  calm: "Softwear",
};
