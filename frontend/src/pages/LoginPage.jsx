import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';
import { fetchCsrfToken, checkAuthStatus } from '../utils/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Login, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Both fields are required');
      setLoading(false);
      return;
    }

    try {
      await fetchCsrfToken();
      const csrfToken = axios.defaults.headers.common['X-CSRF-Token'];

      const response = await apiClient.post(
        '/auth/login',
        { email, password },
        { withCredentials: true, headers: { 'X-CSRF-Token': csrfToken } }
      );

      setStep(2);
    } catch (err) {
      console.log("Login error:", err);
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientIp = async () => {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (error) {
      console.error('Error fetching client IP:', error);
      return null;
    }
  };
  
  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    if (!otp) {
      setError('OTP is required');
      setLoading(false);
      return;
    }
  
    try {
      const clientIp = await fetchClientIp(); // Fetch client IP
      if (!clientIp) {
        throw new Error('Unable to fetch client IP');
      }
  
      await fetchCsrfToken();
      const csrfToken = axios.defaults.headers.common['X-CSRF-Token'];
  
      const response = await apiClient.post(
        '/auth/verify-otp',
        { email, otp, clientIp }, // Send client IP to backend
        { withCredentials: true, headers: { 'X-CSRF-Token': csrfToken } }
      );
  
      const authenticated = await checkAuthStatus();
      if (authenticated) {
        setIsAuthenticated(true);
        navigate('/');
      } else {
        setError('Authentication failed after OTP verification');
      }
    } catch (err) {
      console.log("OTP Verification error:", err);
      setError(err.response?.data?.message || 'OTP verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Login to EchoSecure
        </h2>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPVerification}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="otp">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Verify OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;