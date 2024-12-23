import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import bgImage from "../Images/BG.png"; 
import loginIcon from "../Images/LoginIcon.png";
import Swal from 'sweetalert2';

const Login = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userPass, setUserPass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost/lifely1.0/backend/api/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          userPass
        })
      });

      const data = await response.json();

      if (data.status) {
        await Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome back to Lifely',
          confirmButtonColor: '#FB923C',
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/home');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error: Please check your connection and try again');
    }
  };

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
            <button
              type="submit"
              className="w-full py-3 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition duration-200"
            >
              Log In
            </button>
          </form>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-r from-orange-100 via-pink-100 to-blue-100 items-center justify-center">
          <div className="p-8">
            <img src={loginIcon} alt="Login Icon" className="max-w-[105%] h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;