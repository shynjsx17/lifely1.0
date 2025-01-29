import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bgImage from "../Images/BG.png";
import Swal from 'sweetalert2';

const VerifyEmail = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(900); // 15 minutes in seconds
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { email, name, password } = location.state || {};

    useEffect(() => {
        if (!email) {
            navigate('/register');
            return;
        }

        // Only send OTP when component first mounts
        const sendInitialOTP = async () => {
            if (!otpSent) {
                await sendOTP();
            }
        };
        sendInitialOTP();

        // Start countdown timer
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(interval);
                    setOtpSent(false); // Reset OTP sent status when timer expires
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [email, navigate]); // Remove otpSent from dependencies

    const sendOTP = async () => {
        if (otpSent) {
            console.log('OTP already sent and still valid');
            return;
        }

        try {
            setLoading(true);
            console.log('Sending OTP to:', email);
            
            const response = await fetch('http://localhost/lifely1.0/backend/api/verification.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'generate',
                    email: email
                })
            });

            const data = await response.json();
            console.log('Send OTP response:', data);

            if (!data.status) {
                throw new Error(data.message);
            }

            // Reset timer and mark OTP as sent
            setTimer(900);
            setOtpSent(true);

            Swal.fire({
                icon: 'success',
                title: 'OTP Sent!',
                text: 'Please check your email for the verification code.',
                confirmButtonColor: '#FB923C',
            });
        } catch (error) {
            console.error('Send OTP error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to send verification code',
                confirmButtonColor: '#FB923C',
            });
            setOtpSent(false);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (index, value) => {
        if (value.length > 1) return; // Prevent multiple digits
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const verifyOTP = async () => {
        setLoading(true);
        try {
            console.log('Verifying OTP:', { email, otp: otp.join('') });
            
            // First verify OTP
            const verifyResponse = await fetch('http://localhost/lifely1.0/backend/api/verification.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'verify',
                    email: email,
                    otp: otp.join('')
                })
            });

            const verifyData = await verifyResponse.json();
            console.log('Verify response:', verifyData);

            if (!verifyData.status) {
                throw new Error(verifyData.message);
            }

            // Then register the user
            console.log('Registering user:', { username: name, email });
            
            const registerResponse = await fetch('http://localhost/lifely1.0/backend/api/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: name,
                    email: email,
                    password: password
                })
            });

            const registerData = await registerResponse.json();
            console.log('Register response:', registerData);

            if (!registerData.status) {
                throw new Error(registerData.message);
            }

            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your email has been verified and account created successfully!',
                confirmButtonColor: '#FB923C',
                timer: 1500,
                showConfirmButton: false,
            });

            navigate('/login');
        } catch (error) {
            console.error('Verification error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Verification Failed',
                text: error.message || 'An unexpected error occurred',
                confirmButtonColor: '#FB923C',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-2">Verify Your Email</h2>
                <p className="text-gray-600 text-center mb-6">
                    We've sent a verification code to {email}
                </p>

                <div className="flex justify-center space-x-3 mb-6">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength="1"
                            className="w-12 h-12 text-center text-xl border rounded-lg focus:border-orange-400 focus:ring focus:ring-orange-200"
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                        />
                    ))}
                </div>

                <div className="text-center mb-6">
                    <p className="text-gray-600">Time remaining: {formatTime(timer)}</p>
                    {timer === 0 && (
                        <button
                            onClick={sendOTP}
                            className="text-orange-500 hover:text-orange-600 mt-2"
                        >
                            Resend Code
                        </button>
                    )}
                </div>

                <button
                    onClick={verifyOTP}
                    disabled={loading || otp.some(digit => !digit) || timer === 0}
                    className={`w-full py-3 rounded-lg text-white transition duration-200 ${
                        loading || otp.some(digit => !digit) || timer === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-orange-400 hover:bg-orange-500'
                    }`}
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <p className="mt-4 text-center text-gray-600">
                    Didn't receive the code?{' '}
                    <button
                        onClick={sendOTP}
                        disabled={timer > 0}
                        className={`${
                            timer > 0
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-orange-500 hover:text-orange-600'
                        }`}
                    >
                        Resend
                    </button>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail; 