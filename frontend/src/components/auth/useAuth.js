'use client'
import { useState, useEffect } from 'react';

// A custom React hook for authentication
function useAuthHook() {
    // State to store the user's auth details
    const [auth, setAuth] = useState({
        token: window.localStorage.getItem("token") || null,
        email: window.localStorage.getItem("email") || null,
        username: window.localStorage.getItem("username") || null
    });

    // Effect to load auth details from localStorage when the component mounts

    // Function to handle user login
    const login = (token, email, username) => {
        // Save auth details to state
        setAuth({ token, email, username });
        // Store auth details in localStorage
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('email', email);
        window.localStorage.setItem('username', username);
        window.location.href = window.location.origin;
    };

    // Function to handle user logout
    const logout = () => {
        // Clear auth details from state
        setAuth({ token: null, email: null, username: null });
        // Remove auth details from localStorage
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('email');
        window.localStorage.removeItem('username');
        window.location.href = window.location.origin;
    };

    return {
        auth,
        login,
        logout
    };
}

export default useAuthHook;