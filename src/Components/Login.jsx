import React from "react";
import bgImage from "../Images/BG.png"; 
import loginIcon from "../Images/LoginIcon.png"; 

const Login = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="flex flex-col md:flex-row bg-white shadow-xl rounded-lg overflow-hidden max-w-4xl w-full">
        {/* Left Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center text-center font-poppins">
          <h2 className="text-black-500 text-2xl">Hello again,</h2>
          <h1 className="text-4xl font-bold" style={{ color: '#FFB78B' }}>Welcome to Lifely</h1>
          <p className="text-black-500 text-sm mb-6 mt-3">Please enter your details</p>
          
          <button className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg bg-white hover:shadow-md mb-6">
            <span className="text-lg font-semibold text-gray-700 mr-2">G</span>
            Log in with Google Account
          </button>

          <div className="flex items-center justify-center mb-6 w-full">
            <span className="w-full border-b border-gray-300"></span>
            <span className="px-4 text-gray-500">or</span>
            <span className="w-full border-b border-gray-300"></span>
          </div>
          <form className="w-full">
            <input
              type="email"
              placeholder="Email Address *"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              required
            />
            <input
              type="password"
              placeholder="Password *"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              required
            />
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox text-orange-400 border-gray-300"
                />
                <span className="text-black-500 text-sm ">Remember me</span>
              </label>
              <a href="#" className="text-orange-400 hover:underline">
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
          <p className="text-black-500 text-center mt-6">
            Don’t have an Account?{" "}
            <a href="/register" className="text-orange-400 hover:underline">
              Sign Up
            </a>
          </p>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-r from-orange-100 via-pink-100 to-blue-100">
          <img
            src={loginIcon}
            alt="Login Icon"
            className="max-w-[90%] h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;