import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { server } from "../server";  // ⭐ FIXED

const Quiz = () => {
  const navigate = useNavigate();

  const questions = [
    "I enjoy social gatherings and meeting new people.",
    "I like to plan my day before starting it.",
    "I stay calm even in stressful situations.",
    "I enjoy trying new things and experiences.",
    "I prefer comfort over fashion.",
    "I get easily excited about things.",
    "I enjoy expressing myself through clothing.",
    "I like bold colors instead of neutral tones.",
    "I feel confident when I dress up.",
    "I prefer simple and minimalistic outfits."
  ];

  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [error, setError] = useState("");

  const handleAnswer = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      setError("Please answer all questions!");
      return;
    }

    try {
      const response = await axios.post(
        `${server}/quiz/submit`,
        { answers },
        { withCredentials: true }
      );

      if (response.data.success) {
        navigate("/ai/recommendations");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="w-full flex justify-center items-center p-6 bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Personality Quiz
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Answer a few questions to help us understand your style personality.
        </p>

        {questions.map((q, idx) => (
          <div key={idx} className="mb-6">
            <p className="font-medium mb-2">{idx + 1}. {q}</p>
            <div className="flex gap-4">
              {[1,2,3,4,5].map(num => (
                <button
                  key={num}
                  onClick={() => handleAnswer(idx, num)}
                  className={`px-4 py-2 rounded border 
                    ${answers[idx] === num 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-200 text-gray-700"
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        ))}

        {error && <p className="text-red-600 mt-2 text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

export default Quiz;
