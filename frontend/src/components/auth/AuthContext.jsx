'use client'

import React, { createContext, useContext, useEffect } from 'react';
import useAuthHook from './useAuth';
// Define the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const { auth, login, logout } = useAuthHook();

  // Initialize the authentication state
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/authorize`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          }
        });
        const data = await response.json();
        if (!data.success)
          logout();
      } catch (error) {
          console.error('Error fetching data:', error);
        
      }
    };

    if (auth.token != null)
      fetchData();
    
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);