const API_BASE_URL = 'http://localhost:3000'; // Should be in .env

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

export const apiLogin = async (credentials) => {
	const response = await fetch(`${API_BASE_URL}/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(credentials),
	});
	return handleResponse(response);
};

export const apiRegister = async (userData) => {
	const response = await fetch(`${API_BASE_URL}/auth/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(userData),
	});
	return handleResponse(response);
};

// --- NEW FUNCTION ---
// Fetches insights from the backend, including filter parameters and the auth token.
export const apiGetInsights = async (filters, token) => {
	const params = new URLSearchParams();
	if (filters.page) params.append('page', filters.page);
	if (filters.limit) params.append('limit', filters.limit);
	if (filters.type && filters.type !== 'all')
		params.append('type', filters.type);
	if (filters.tag && filters.tag !== 'all') params.append('tag', filters.tag);
	if (filters.dateRange?.start)
		params.append('startDate', filters.dateRange.start);
	if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end);

	const headers = {
		'Content-Type': 'application/json',
	};

	// The backend's OptionalJwtAuthGuard will handle this gracefully
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
