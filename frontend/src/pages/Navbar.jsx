import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import { useAuth } from '../utils/AuthContext';
import { FaBars, FaHome, FaUser, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDrawer = (open) => () => {
    setMobileOpen(open);
  };

  const menuItems = isAuthenticated
    ? [
        { text: 'Home', to: '/', icon: <FaHome /> },
        { text: 'Users', to: '/users', icon: <FaUser /> },
        { text: 'Logout', action: handleLogout, icon: <FaSignOutAlt />, color: 'text-red-500' },
      ]
    : [
        { text: 'Login', to: '/login', icon: <FaSignInAlt /> },
      ];

  return (
    <>
      <nav className="bg-gray-900 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={toggleDrawer(true)} className="text-white md:hidden">
              <FaBars />
            </button>

            <Link to="/" className="text-2xl font-bold text-white">
              EchoSecure
            </Link>

            <div className="hidden md:flex gap-4 items-center">
              {menuItems.map((item, index) =>
                item.action ? (
                  <button
                    key={index}
                    className={`text-white flex items-center gap-2 ${item.color || ''}`}
                    onClick={item.action}
                  >
                    {item.icon}
                    {item.text}
                  </button>
                ) : (
                  <Link
                    key={index}
                    to={item.to}
                    className="text-white flex items-center gap-2"
                  >
                    {item.icon}
                    {item.text}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${mobileOpen ? 'block' : 'hidden'}`} onClick={toggleDrawer(false)}>
        <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg">
          <div className="p-4">
            <div className="flex justify-end mb-4">
              <button onClick={toggleDrawer(false)} className="text-gray-500">
                <FaBars />
              </button>
            </div>

            <div className="space-y-4">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.action ? (
                    <button
                      onClick={item.action}
                      className={`flex items-center gap-2 text-sm text-black ${item.color || ''}`}
                    >
                      {item.icon}
                      {item.text}
                    </button>
                  ) : (
                    <Link to={item.to} className="flex items-center gap-2 text-sm text-black">
                      {item.icon}
                      {item.text}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;