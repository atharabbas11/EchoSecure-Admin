import React, { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { fetchCsrfToken } from '../utils/auth';  // Import fetchCsrfToken

const Signup = () => {
  const [email, setEmail] = useState('');  // Changed from username to email
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Ensure CSRF token is set before submitting the form
  useEffect(() => {
    const setCsrfToken = async () => {
      await fetchCsrfToken(); // Fetch and set CSRF token globally
    };
    setCsrfToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const csrfToken = axios.defaults.headers.common['X-CSRF-Token'];

      // Send the signup request
      const response = await apiClient.post( 
        '/auth/register', 
        { email, password }, 
        { withCredentials: true, headers: { 'X-CSRF-Token': csrfToken } }
      );

      alert(response.data.message); // Show success message
      navigate('/login'); // Redirect to login page after signup
    } catch (error) {
      // Handle undefined errors gracefully
      const errorMessage = error.response?.data?.message || "An unknown error occurred.";
      alert(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="email"  // Changed from text to email
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
        >
          Sign Up
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
