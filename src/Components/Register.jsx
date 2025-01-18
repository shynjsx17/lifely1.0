import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from "../Images/BG.png"; 
import registerIcon from "../Images/RegisterIcon.png"; 
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPass, setRepeatPass] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: 'gray'
  });
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = '';

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Complexity checks
    if (/[A-Z]/.test(password)) score++; // Has uppercase
    if (/[0-9]/.test(password)) score++; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score++; // Has special char

    // Determine message and color based on score
    switch (score) {
      case 0:
        feedback = 'Very Weak';
        return { score, message: feedback, color: 'red' };
      case 1:
        feedback = 'Weak';
        return { score, message: feedback, color: '#ff4e50' };
      case 2:
        feedback = 'Fair';
        return { score, message: feedback, color: '#ffa700' };
      case 3:
        feedback = 'Good';
        return { score, message: feedback, color: '#9bc158' };
      case 4:
      case 5:
        feedback = 'Strong';
        return { score, message: feedback, color: '#4CAF50' };
      default:
        return { score: 0, message: '', color: 'gray' };
    }
  };

  const validatePassword = (password) => {
    // Password must be at least 8 characters long
    return password.length >= 8;
  };

  useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, message: '', color: 'gray' });
    }
  }, [password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validations
    if (!name.trim() || !email.trim() || !password.trim() || !repeatPass.trim()) {
      setError('All fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== repeatPass) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await signup({ name, email, password });
      
      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Welcome to Lifely',
        confirmButtonColor: '#FB923C',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed');
    }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => {
    if (!password) return null;
    
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">Password Strength:</span>
          <span className="text-sm" style={{ color: passwordStrength.color }}>
            {passwordStrength.message}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${(passwordStrength.score / 5) * 100}%`,
              backgroundColor: passwordStrength.color
            }}
          ></div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Password should contain:
          <ul className="list-disc ml-5 mt-1">
            <li className={password.length >= 8 ? "text-green-500" : ""}>At least 8 characters</li>
            <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>One uppercase letter</li>
            <li className={/[0-9]/.test(password) ? "text-green-500" : ""}>One number</li>
            <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-500" : ""}>One special character</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen font-poppins"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="flex flex-col md:flex-row bg-white shadow-xl rounded-lg overflow-hidden max-w-4xl w-full">
        {/* Left Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center text-center font-poppins">
          <h2 className="text-black-500 text-2xl">Hello there,</h2>
          <h1 className="text-4xl font-bold" style={{ color: '#FFB78B' }}>Welcome to Lifely</h1>
          <p className="text-black-500 text-sm mb-6 mt-3">Please enter your details</p>

          <form onSubmit={handleRegister} className="w-full">
            <input
              type="text"
              placeholder="Name *"
              className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email Address *"
              className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password *"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <PasswordStrengthIndicator />
            <div className="relative mb-6">
              <input
                type={showRepeatPassword ? "text" : "password"}
                placeholder="Repeat Password *"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
                value={repeatPass}
                onChange={(e) => setRepeatPass(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
              >
                {showRepeatPassword ? (
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
            {error && <p className="text-red-500 mb-4">{error}</p>}
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
