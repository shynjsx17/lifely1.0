import React from 'react';
import bgImage from "../Images/BG.png"; 
import registerIcon from "../Images/RegisterIcon.png"; 

const Register = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen font-poppins"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="flex flex-col md:flex-row bg-white shadow-xl rounded-lg overflow-hidden max-w-4xl w-full">
        {/* Left Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center text-center font-poppins">
          <h2 className="text-black-500 text-2xl">Hello there,</h2>
          <h1 className="text-4xl font-bold" style={{ color: '#FFB78B' }}>Welcome to Lifely</h1>
          <p className="text-black-500 text-sm mb-6 mt-3">Please enter your details</p>
          
          <button className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg bg-white hover:shadow-md mb-6">
            <span className="text-lg font-semibold text-gray-700 mr-2">G</span>
            Sign up with Google Account
          </button>

          <div className="flex items-center justify-center mb-6 w-full">
            <span className="w-full border-b border-gray-300"></span>
            <span className="px-4 text-gray-500">or</span>
            <span className="w-full border-b border-gray-300"></span>
          </div>

          <form>
            <input
              type="text"
              placeholder="Username *"
              className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
            />
            <input
              type="email"
              placeholder="Email Address *"
              className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
            />
            <input
              type="password"
              placeholder="Password *"
              className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
            />
            <input
              type="password"
              placeholder="Repeat Password *"
              className="w-full px-4 py-2 mb-6 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
            />
            <button
              type="submit"
              className="w-full py-3 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition duration-200"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-4 text-center text-black-600">
            Already have an Account?{' '}
            <a href="/login" className="text-orange-500 hover:underline">
              Log In
            </a>
          </p>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-r from-orange-100 via-pink-100 to-blue-100 items-center justify-center">
          <div className="p-8">
            <img
              src={registerIcon}
              alt="Register Icon"
              className="max-w-[105%] h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
