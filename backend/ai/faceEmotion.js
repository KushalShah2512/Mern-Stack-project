const ort = require("onnxruntime-node");
const fs = require("fs");
const path = require("path");

// Pretrained emotion model (I will provide link)
let session = null;

exports.loadFaceModel = async () => {
  if (session) return;

  session = await ort.InferenceSession.create(
    path.join(__dirname, "emotionModel.onnx")
  );
};

// List of emotions model predicts
const EMOTIONS = ["neutral", "happy", "sad", "surprise", "anger"];

exports.detectEmotion = async (buffer) => {
  try {
    if (!session) await exports.loadFaceModel();

    // VERY simplified: convert buffer to tensor
    const inputTensor = new ort.Tensor("uint8", buffer, [1, buffer.length]);

    const output = await session.run({ input: inputTensor });

    const scores = output.output.data;
    const maxIndex = scores.indexOf(Math.max(...scores));

    return EMOTIONS[maxIndex] || "neutral";
  } catch (err) {
    console.error("Emotion detection error:", err);
    return "neutral";
  }
};
