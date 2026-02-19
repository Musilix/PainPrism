import React, {
	createContext,
	useState,
	useContext,
	useEffect,
	useCallback,
} from 'react';
import { jwtDecode } from 'jwt-decode';

// --- INLINED DEPENDENCIES TO PREVENT BUILD ERRORS ---

const API_BASE_URL = 'http://localhost:3000';

const handleResponse = async (response) => {
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({
			message: 'An unknown error occurred.',
		}));
		throw new Error(
			errorData.message || `HTTP error! status: ${response.status}`
		);
	}
	return response.json();
};

export const apiGetInsights = async (filters, token) => {
	const params = new URLSearchParams();
	if (filters.page) params.append('page', filters.page);
	if (filters.limit) params.append('limit', filters.limit);
	if (filters.type && filters.type !== 'all')
		params.append('type', filters.type);
	if (filters.tags && filters.tags.length > 0) {
		params.append('tags', filters.tags.join(','));
	}
	if (filters.dateRange?.start)
		params.append('startDate', filters.dateRange.start);
	if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end);
	if (filters.sortBy) params.append('sortBy', filters.sortBy);
	if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

	const headers = {
		'Content-Type': 'application/json',
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(
		`${API_BASE_URL}/insights?${params.toString()}`,
		{
			method: 'GET',
			headers,
		}
	);

	return handleResponse(response);
};

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

// --- END INLINED DEPENDENCIES ---

// Debounce function to prevent API calls on every rapid filter change
function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

export const useInsights = (initialConfig = {}) => {
	const { token } = useAuth() || {};
	const [insights, setInsights] = useState([]);
	const [allTags, setAllTags] = useState(['all']);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const [page, setPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	const [sort, setSort] = useState({ sortBy: 'date', sortOrder: 'desc' });

	const limit = initialConfig.limit || 20;
	const totalPages = Math.ceil(totalCount / limit);

	const [filters, setFilters] = useState({
		type: 'all',
		tags: [],
		dateRange: { start: '', end: '' },
	});

	const fetchInsights = useCallback(
		async (currentFilters, currentPage, currentSort) => {
			setIsLoading(true);
			setError(null);

			try {
				const queryFilters = {
					...currentFilters,
					page: currentPage,
					limit,
					sortBy: currentSort.sortBy,
					sortOrder: currentSort.sortOrder,
				};
				const response = await apiGetInsights(queryFilters, token);

				// FIX: Correctly handle the API response object
				const fetchedData = response.data || [];
				const total = response.total || 0;

				setTotalCount(total);

				let processedData = fetchedData.map((item) => ({
					...item,
					text: item.textSummary,
					date: item.createdAt,
				}));

				if (initialConfig.limit) {
					processedData.sort(() => 0.5 - Math.random());
					processedData = processedData.slice(0, initialConfig.limit);
				}

				setInsights(processedData);

				const newTags = new Set(
					fetchedData.flatMap((i) => i.tags || [])
				);
				setAllTags((prevTags) => [
					'all',
					...Array.from(
						new Set([...prevTags.slice(1), ...newTags])
					).sort(),
				]);
			} catch (err) {
				setError(err);
			} finally {
				setIsLoading(false);
			}
		},
		[token, limit, initialConfig.limit]
	);

	const debouncedFetch = useCallback(debounce(fetchInsights, 300), [
		fetchInsights,
	]);

	useEffect(() => {
		if (page !== 1 && !initialConfig.limit) {
			setPage(1);
		}
		debouncedFetch(filters, page, sort);
	}, [filters, sort, debouncedFetch]);

	useEffect(() => {
		if (!initialConfig.limit) {
			debouncedFetch(filters, page, sort);
		}
	}, [page]);

	return {
		insights,
		filters,
		setFilters,
		sort,
		setSort,
		allTags,
		isLoading,
		error,
		page,
		setPage,
		totalPages,
		totalCount,
	};
};
