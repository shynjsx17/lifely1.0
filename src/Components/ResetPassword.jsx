import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bgImage from "../Images/BG.png";
import Swal from 'sweetalert2';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get token and email from URL parameters
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Link',
                text: 'The password reset link is invalid or has expired.',
                confirmButtonColor: '#FB923C',
            }).then(() => {
                navigate('/login');
            });
        }
    }, [token, email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Passwords Do Not Match',
                text: 'Please make sure your passwords match.',
                confirmButtonColor: '#FB923C',
            });
            return;
        }

        if (password.length < 8) {
            Swal.fire({
                icon: 'error',
                title: 'Password Too Short',
                text: 'Password must be at least 8 characters long.',
                confirmButtonColor: '#FB923C',
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost/lifely1.0/backend/api/reset_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (data.status) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Password Reset Successful',
                    text: 'Your password has been reset successfully. Please log in with your new password.',
                    confirmButtonColor: '#FB923C',
                });
                navigate('/login');
            } else {
                throw new Error(data.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to reset password',
                confirmButtonColor: '#FB923C',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center"
             style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover' }}>
            <div className="bg-white p-8 rounded-lg shadow-md w-96 space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                    Reset Password
                </h2>
                <p className="text-gray-600 text-center mb-6">
                    Please enter your new password below.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400"
                            placeholder="Enter new password"
                            minLength="8"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400"
                            placeholder="Confirm new password"
                            minLength="8"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-orange-400 text-white py-2 rounded-md hover:bg-orange-500 transition-colors
                                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword; 