function averageBrightness(palette) {
  if (!palette || palette.length === 0) return 0;

  const brightnessValues = palette.map(hex => {
    const rgb = hexToRgb(hex);
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  });

  return Math.round(
    brightnessValues.reduce((a, b) => a + b, 0) / brightnessValues.length
  );
}

function hexToRgb(hex) {
  const parsed = hex.replace("#", "");
  return {
    r: parseInt(parsed.substring(0, 2), 16),
    g: parseInt(parsed.substring(2, 4), 16),
    b: parseInt(parsed.substring(4, 6), 16),
  };
}

module.exports = { averageBrightness };
