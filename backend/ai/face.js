const faceapi = require("@vladmandic/face-api");
const canvas = require("canvas");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelLoaded = false;

exports.loadFaceModel = async () => {
  if (modelLoaded) return;
  await faceapi.nets.tinyFaceDetector.loadFromDisk("./ai/models");
  await faceapi.nets.faceExpressionNet.loadFromDisk("./ai/models");
  modelLoaded = true;
};

exports.detectEmotion = async (buffer) => {
  const img = await canvas.loadImage(buffer);
  const detections = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions();

  if (!detections) return null;

  let highest = "";
  let value = 0;

  Object.entries(detections.expressions).forEach(([key, val]) => {
    if (val > value) {
      highest = key;
      value = val;
    }
  });

  return highest; // e.g., "happy"
};
