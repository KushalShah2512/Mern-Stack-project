import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.put(
        `http://localhost:8000/api/v2/user/reset-password/${token}`,
        {
          password,
          confirmPassword,
        }
      );

      alert("Password Reset Successful!");

      setLoading(false);

      navigate("/login");
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
          Reset Password
        </h1>

        <form onSubmit={submitHandler}>
          <div className="mb-5">
            <label className="block pb-2 text-[16px] font-Poppins">
              New Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-3 py-3 border border-gray-300 rounded-md outline-none focus:border-red-500"
            />
          </div>

          <div className="mb-5">
            <label className="block pb-2 text-[16px] font-Poppins">
              Confirm Password
            </label>

            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3 py-3 border border-gray-300 rounded-md outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[45px] bg-[#e44343] text-white rounded-md font-semibold hover:bg-[#d63030] transition duration-300"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;