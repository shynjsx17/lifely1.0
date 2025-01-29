import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [cooldownEnd, setCooldownEnd] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (cooldownEnd) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        if (now >= cooldownEnd) {
          setCooldownEnd(null);
          setLoginAttempts(0);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownEnd]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const startCooldown = async () => {
    const cooldownTime = 2 * 60 * 1000; // 2 minutes in milliseconds
    const endTime = new Date().getTime() + cooldownTime;
    setCooldownEnd(endTime);

    await Swal.fire({
      icon: "warning",
      title: "Too Many Failed Attempts",
      text: "Please wait 2 minutes before trying again",
      confirmButtonColor: "#FB923C",
      timer: 3000,
      showConfirmButton: false,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (cooldownEnd) {
      const remainingTime = Math.ceil((cooldownEnd - new Date().getTime()) / 1000);
      await Swal.fire({
        icon: "warning",
        title: "Please Wait",
        text: `Try again in ${remainingTime} seconds`,
        confirmButtonColor: "#FB923C",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

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
      await login({ email, password });
      setLoginAttempts(0);
      await Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "Welcome back to Lifely",
        confirmButtonColor: "#FB923C",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Invalid email or password.");
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 4) {
        await startCooldown();
      } else {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: `Invalid credentials. ${4 - newAttempts} attempts remaining before cooldown.`,
          confirmButtonColor: "#FB923C",
          timer: 2000,
          showConfirmButton: false,
        });
      }
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
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password *"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
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
              <Link to="/forgot-password" className="text-orange-500 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition duration-200"
            >
              Log In
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#FFB78B] hover:text-[#ffa770]">
                Register here
              </Link>
            </p>
          </div>
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
