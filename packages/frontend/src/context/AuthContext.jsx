import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	// In a real app, you'd initialize this from localStorage
	const [user, setUser] = useState(null);

	// Example login function
	const login = (userData) => {
		setUser(userData);
		// In a real app, you'd also set the JWT in localStorage here
	};

	// Example logout function
	const logout = () => {
		setUser(null);
		// In a real app, you'd remove the JWT from localStorage
	};

	const value = {
		user,
		isLoggedIn: !!user,
		isProUser: user?.status === 'pro', // Assuming the user object has a status
		login,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
