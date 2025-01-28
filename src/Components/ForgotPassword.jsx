import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import bgImage from "../Images/BG.png";
import Swal from 'sweetalert2';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        console.log('ForgotPassword component mounted');
        console.log('Current pathname:', location.pathname);
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost/lifely1.0/backend/api/forgot_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Check Your Email',
                    text: 'If an account exists with this email, you will receive password reset instructions.',
                    confirmButtonColor: '#FB923C',
                });
                setEmail('');
            } else {
                throw new Error(data.message || 'Failed to send reset instructions');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to process request',
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
                    Forgot Password
                </h2>
                <p className="text-gray-600 text-center mb-6">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-400"
                            placeholder="Enter your email"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-orange-400 text-white py-2 rounded-md hover:bg-orange-500 transition-colors
                                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Instructions'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <Link to="/login" className="text-orange-400 hover:text-orange-500">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword; 