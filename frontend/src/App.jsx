// App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { fetchCsrfToken } from './utils/auth';
import Login from './pages/LoginPage';
import Signup from './pages/SignupPage';
import Home from './pages/Home';
import Navbar from './pages/Navbar';
import ProtectedRoute from './utils/protectedRoutes';
import UsersList from './pages/UserList';
import ErrorBoundary from './ErrorBoundary';

import './index.css';
const App = () => {
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  return (
    <Router>
      <Navbar />
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
{/*           <Route path="/signup" element={<Signup />} /> */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
