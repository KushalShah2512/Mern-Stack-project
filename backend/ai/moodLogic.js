function computeMood(brightness) {
  if (brightness >= 180) return "bright";
  if (brightness >= 120) return "warm";
  if (brightness >= 80) return "neutral";
  if (brightness >= 40) return "moody";
  return "dark";
}

const moodToCategory = {
  bright: "Summer Casual",
  warm: "Festive / Ethnic",
  neutral: "Smart Casual",
  moody: "Streetwear",
  dark: "Elegant Nightwear",
};

module.exports = { computeMood, moodToCategory };
