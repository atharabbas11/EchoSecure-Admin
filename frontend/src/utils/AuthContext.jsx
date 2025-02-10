// utils/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkAuthStatus } from './auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAuthStatus();
      setIsAuthenticated(authenticated);
    };
    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);