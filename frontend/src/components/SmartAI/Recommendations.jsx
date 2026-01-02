import React, { useEffect, useState } from "react";
import axios from "axios";
import { server, backend_url } from "../../server";

const AIRecommendations = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState("");

  // 🚀 Fetch latest recommendations
  const loadLatest = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${server}/recommend/latest`,
        { withCredentials: true }
      );

      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        setRecommendations(null);
      }
    } catch (err) {
      console.log(err);
      setError("Unable to load recommendations.");
    }
    setLoading(false);
  };

  // 🔄 Regenerate recommendations
  const regenerate = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${server}/recommend/generate`,
        {},
        { withCredentials: true }
      );

      await loadLatest();
    } catch (err) {
      console.log(err);
      setError("Failed to regenerate recommendations.");
    }
    setLoading(false);
  };

  // Load once when page opens
  useEffect(() => {
    loadLatest();
  }, []);

  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-4">AI Outfit Recommendations</h1>

      {loading && <p className="text-lg">Loading recommendations...</p>}

      {error && <p className="text-red-600">{error}</p>}

      {/* When no recommendations exist */}
      {!loading && !recommendations && (
        <div>
          <p className="text-gray-600 mb-4">
            No recommendations available right now. Try taking the quiz or regenerating.
          </p>

          <button
            onClick={regenerate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Regenerate Recommendations
          </button>
        </div>
      )}

      {/* Display recommendations */}
      {recommendations && (
        <>
          <button
            onClick={regenerate}
            className="px-6 py-3 mb-6 bg-blue-600 text-white rounded-lg"
          >
            Regenerate Recommendations
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.items.map((item) => (
              <div
                key={item.productId?._id}
                className="border p-4 rounded shadow"
              >
                <img
                  src={`${backend_url}${item.productId?.images[0]}`}
                  className="w-full h-40 object-cover rounded"
                  alt=""
                />

                <h2 className="text-lg font-semibold mt-2">
                  {item.productId?.name}
                </h2>

                <p className="text-gray-600">{item.reason}</p>
                <p className="text-sm text-blue-600 font-semibold">
                  Score: {item.score.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AIRecommendations;
