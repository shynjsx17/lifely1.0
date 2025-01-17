import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from "../Images/BG.png"; 
import registerIcon from "../Images/RegisterIcon.png"; 
import Swal from 'sweetalert2';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPass, setRepeatPass] = useState('');
  const [error, setError] = useState('');
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
    if (!username.trim() || !email.trim() || !password.trim() || !repeatPass.trim()) {
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
      const response = await fetch('http://localhost/lifely1.0/backend/api/auth.php?action=signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Welcome to Lifely',
          confirmButtonColor: '#FB923C',
          confirmButtonText: 'Continue to Login',
        });
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error: Please check your connection and try again');
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
              placeholder="Username *"
              className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email Address *"
              className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password *"
              className="w-full px-4 py-2 mb-2 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrengthIndicator />
            <input
              type="password"
              placeholder="Repeat Password *"
              className="w-full px-4 py-2 mb-6 border rounded-md focus:outline-none focus:ring focus:ring-orange-200"
              value={repeatPass}
              onChange={(e) => setRepeatPass(e.target.value)}
            />
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
