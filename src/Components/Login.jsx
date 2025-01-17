import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../Images/BG.png";
import { useAuth } from "../context/AuthContext";
import loginIcon from "../Images/LoginIcon.png";
import Swal from "sweetalert2";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validations
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      setError("Password cannot be empty.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/lifely1.0/backend/api/auth.php?action=login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Store session token if remember me is checked
        if (rememberMe) {
          localStorage.setItem('session_token', data.session_token);
        } else {
          sessionStorage.setItem('session_token', data.session_token);
        }

        // Store user data
        login(data.user);

        await Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: "Welcome back to Lifely",
          confirmButtonColor: "#FB923C",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/home");
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error: Please check your connection and try again.");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col md:flex-row bg-white shadow-xl rounded-lg overflow-hidden max-w-4xl w-full">
        {/* Left Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center text-center font-poppins">
          <h2 className="text-black-500 text-2xl">Hello again,</h2>
          <h1 className="text-4xl font-bold" style={{ color: "#FFB78B" }}>
            Welcome to Lifely
          </h1>
          <p className="text-black-500 text-sm mb-6 mt-3">
            Please enter your details
          </p>

          <form onSubmit={handleLogin} className="w-full">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address *"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password *"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              required
            />
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2"
                />
                Remember me
              </label>
              <a href="#" className="text-orange-500 hover:underline">
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition duration-200"
            >
              Log In
            </button>
          </form>

          <p className="mt-4 text-center text-black-600">
            Don't have an Account?{" "}
            <a href="/register" className="text-orange-500 hover:underline">
              Sign Up
            </a>
          </p>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-r from-orange-100 via-pink-100 to-blue-100 items-center justify-center">
          <div className="p-8">
            <img
              src={loginIcon}
              alt="Login Icon"
              className="max-w-[105%] h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
