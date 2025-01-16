import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "../Images/BG.png";
import { useAuth } from "../context/AuthContext";
import loginIcon from "../Images/LoginIcon.png";
import Swal from "sweetalert2";
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/authService';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const [userEmail, setUserEmail] = useState("");
  const [userPass, setUserPass] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    // Ensure the email is in a valid Gmail format
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validations
    if (!validateEmail(userEmail)) {
      setError("Invalid email address. Only Gmail addresses are allowed.");
      return;
    }

    if (!userPass.trim()) {
      setError("Password cannot be empty.");
      return;
    }

    try {
      // Use authService for login
      const response = await authService.login(userEmail, userPass);
      
      if (response.status) {
        // Use the login function from AuthContext
        await login(response.data);

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
        setError(response.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error: Please check your connection and try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse);
      navigate('/home');
    } catch (err) {
      setError('Google login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
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

          <div className="flex justify-center w-full mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={(error) => {
                console.error('Google login error:', error);
                if (error.message?.includes('blocked')) {
                  setError('Please disable your ad blocker or privacy extensions to use Google login.');
                } else if (error.message?.includes('declined')) {
                  setError('Login was cancelled. Please try again.');
                } else if (error.message?.includes('Cross-Origin-Opener-Policy')) {
                  setError('Browser security policy is blocking the login. Please try a different browser.');
                } else if (error.message?.includes('Invalid response')) {
                  setError('Server error. Please try again later.');
                } else {
                  handleGoogleError(error);
                }
              }}
              useOneTap={false}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
            />
          </div>

          <div className="flex items-center justify-center mb-6 w-full">
            <span className="w-full border-b border-gray-300"></span>
            <span className="px-4 text-gray-500">or</span>
            <span className="w-full border-b border-gray-300"></span>
          </div>

          <form onSubmit={handleLogin}>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Email Address *"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              required
            />
            <input
              type="password"
              value={userPass}
              onChange={(e) => setUserPass(e.target.value)}
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
            <Link to="/register" className="text-orange-500 hover:underline">
              Sign Up
            </Link>
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
