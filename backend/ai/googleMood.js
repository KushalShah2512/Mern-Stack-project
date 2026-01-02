const axios = require("axios");

exports.detectFaceEmotion = async (imageBase64) => {
  const API_KEY = process.env.GOOGLE_VISION_KEY;

  const request = {
    requests: [
      {
        image: { content: imageBase64 },
        features: [{ type: "FACE_DETECTION", maxResults: 1 }]
      }
    ]
  };

  const res = await axios.post(
    `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
    request
  );

  const face = res.data.responses[0].faceAnnotations?.[0];

  if (!face) return "neutral";

  const emotions = {
    joy: face.joyLikelihood,
    sorrow: face.sorrowLikelihood,
    anger: face.angerLikelihood,
    surprise: face.surpriseLikelihood,
  };

  // Pick highest "VERY_LIKELY"
  let best = "neutral";
  Object.entries(emotions).forEach(([emotion, value]) => {
    if (value === "VERY_LIKELY" || value === "LIKELY") {
      best = emotion;
    }
  });

  return best;
};
