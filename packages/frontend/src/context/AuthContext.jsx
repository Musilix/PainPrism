import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // We need a JWT decoding library

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(() => localStorage.getItem('authToken'));
	const [user, setUser] = useState(null);

	useEffect(() => {
		if (token) {
			try {
				const decodedUser = jwtDecode(token);
				setUser(decodedUser);
			} catch (error) {
				console.error('Failed to decode token:', error);
				setToken(null);
				localStorage.removeItem('authToken');
			}
		} else {
			setUser(null);
		}
	}, [token]);

	const login = (newToken) => {
		localStorage.setItem('authToken', newToken);
		setToken(newToken);
	};

	const logout = () => {
		localStorage.removeItem('authToken');
		setToken(null);
	};

	const value = {
		user,
		token,
		isLoggedIn: !!user,
		isProUser: user?.status === 'pro',
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