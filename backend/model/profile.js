const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  personalityVector: {
    openness: Number,
    conscientiousness: Number,
    extraversion: Number,
    agreeableness: Number,
    neuroticism: Number,
  },

  tags: [String],
  quizAnswers: Array,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("profile", profileSchema);
