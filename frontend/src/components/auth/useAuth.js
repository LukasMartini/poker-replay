'use client'
import { useState, useEffect } from 'react';

// A custom React hook for authentication
function useAuthHook() {
    // State to store the user's auth details
    const [auth, setAuth] = useState({ token: null, email: null, username: null });
    const [isDemoUser, setIsDemoUser] = useState(false);

    // Effect to load auth details from localStorage when the component mounts

        // Function to handle user login
    const login = (token, email, username) => {
        // Save auth details to state
        setAuth({ token, email, username });
        // Store auth details in localStorage
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('email', email);
        window.localStorage.setItem('username', username);
        // Use environment variable for root URL or fallback to origin
        const rootUrl = process.env.NEXT_PUBLIC_ROOT_URL || window.location.origin;
        window.location.href = rootUrl;
    };

    // Function to handle user logout
    const logout = () => {
        // Clear auth details from state
        setAuth({ token: null, email: null, username: null });
        setIsDemoUser(false);
        // Remove auth details from localStorage
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('email');
        window.localStorage.removeItem('username');
        // Use environment variable for root URL or fallback to origin
        const rootUrl = process.env.NEXT_PUBLIC_ROOT_URL || window.location.origin;
        window.location.href = rootUrl;
    };

    useEffect(() => {
        // Get auth details from localStorage
        const token = window.localStorage.getItem('token');
        const email = window.localStorage.getItem('email');
        const username = window.localStorage.getItem('username');
        // If auth details are found, save them to state
        if (token && email && username) {
            setAuth({ token: token, email: email, username: username });
        }
    }, []);

    return {
        auth,
        login,
        logout,
        isDemoUser,
        setIsDemoUser
    };
}

export default useAuthHook;