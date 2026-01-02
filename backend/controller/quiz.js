const express = require("express");
const router = express.Router();
const Profile = require("../model/profile");
const { isAuthenticated } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// ----------------------------
// Compute personality vector
// ----------------------------
function computeVector(ans) {
  return {
    openness: Math.round((ans[3] + ans[6]) / 2),
    conscientiousness: Math.round((ans[1] + (6 - ans[7])) / 2),
    extraversion: Math.round((ans[0] + ans[5]) / 2),
    agreeableness: Math.round((ans[4] + ans[8]) / 2),
    neuroticism: Math.round(((6 - ans[2]) + ans[9]) / 2),
  };
}

// ----------------------------
// QUIZ SUBMISSION
// ----------------------------
router.post(
  "/submit",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const { answers } = req.body;
    const userId = req.user._id;

    if (!answers || answers.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid answers submitted.",
      });
    }

    const vector = computeVector(answers);

    const profile = await Profile.findOneAndUpdate(
      { userId },
      {
        personalityVector: vector,
        quizAnswers: answers,
        tags: ["minimalist", "casual"],
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, profile });
  })
);

// ----------------------------
// GET PROFILE (OPTIONAL)
// ----------------------------
router.get(
  "/profile",
  isAuthenticated,
  catchAsyncErrors(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user._id });

    res.json({ success: true, profile });
  })
);

module.exports = router;
