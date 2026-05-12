import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await axios.post(
        "http://localhost:8000/api/v2/user/forgot-password",
        { email }
      );

      alert(data.message);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb')",
      }}
    >
      <div className="w-[95%] sm:w-[420px] bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-[32px] font-Poppins font-bold text-center text-[#000000c1] mb-6">
          Forgot Password
        </h1>

        <form onSubmit={submitHandler}>
          <div className="mb-5">
            <label className="block pb-2 text-[16px] font-Poppins">
              Email address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-3 border border-gray-300 rounded-md outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[45px] bg-[#e44343] text-white rounded-md font-semibold hover:bg-[#d63030] transition duration-300"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center mt-5">
            <span className="text-[15px] text-gray-600">
              Remember your password?
            </span>

            <Link
              to="/login"
              className="text-[#e44343] pl-2 font-semibold hover:underline"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;