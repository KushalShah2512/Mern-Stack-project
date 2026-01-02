import React, { useState } from "react";
import axios from "axios";
import { server } from "../../server";

const MoodDetector = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const analyzeMood = async () => {
    if (!image) {
      setError("Please upload an image first!");
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const { data } = await axios.post(
        `${server}/mood/analyze`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      console.log("Mood API Response:", data);

      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || "Could not analyze mood.");
      }

    } catch (err) {
      console.error("Mood Error:", err);
      setError("Error analyzing mood.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Mood-Based Outfit Detector 🎨</h1>

      <div className="border p-4 rounded-lg bg-white shadow">
        <input type="file" accept="image/*" onChange={handleFile} />
      </div>

      {preview && (
        <div className="mt-4">
          <p className="font-semibold">Image Preview:</p>
          <img src={preview} alt="preview" className="w-60 rounded shadow-md" />
        </div>
      )}

      <button
        onClick={analyzeMood}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Analyzing..." : "Analyze Mood"}
      </button>

      {error && <p className="text-red-600 mt-3">{error}</p>}

      {result && (
        <div className="mt-8 p-6 rounded-lg bg-gray-100 shadow">
          <h2 className="text-2xl font-bold mb-4">Mood Analysis Result</h2>

          <p><strong>Mood:</strong> {result.mood}</p>
          <p><strong>Category:</strong> {result.preferredCategory}</p>

          {/* SAFE PALETTE */}
          <div className="mt-4">
            <p className="font-semibold mb-1">Color Palette:</p>
            <div className="flex gap-2">
              {(result.palette || []).map((color, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            onClick={() => (window.location.href = "/ai/recommendations")}
          >
            View Outfit Recommendations
          </button>
        </div>
      )}
    </div>
  );
};

export default MoodDetector;
