import { useState, useEffect, useCallback } from 'react';
import { apiGetInsights } from '../utils/api';
import { useAuth } from '../context/AuthContext';

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
	const { token } = useAuth();
	const [insights, setInsights] = useState([]);
	const [allTags, setAllTags] = useState(['all']);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// New state for pagination
	const [page, setPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0); // Mocked for now

	const limit = initialConfig.limit || 20;
	const totalPages = Math.ceil(totalCount / limit);

	const [filters, setFilters] = useState({
		type: 'all',
		tag: 'all',
		dateRange: { start: '', end: '' },
	});

	// The fetch function is now simpler, just gets a specific page
	const fetchInsights = useCallback(
		async (currentFilters, currentPage) => {
			setIsLoading(true);
			setError(null);

			try {
				const queryFilters = {
					...currentFilters,
					page: currentPage,
					limit,
				};
				const fetchedData = await apiGetInsights(queryFilters, token);

				// TODO: In a real app, the API would return the total count.
				// We are mocking it here for UI development.
				setTotalCount(100);

				const mappedData = fetchedData.map((item) => ({
					...item,
					text: item.textSummary,
					date: item.createdAt,
				}));

				setInsights(mappedData);

				const newTags = new Set(
					mappedData.flatMap((i) => i.tags || [])
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
		[token, limit]
	);

	// Debounced version for filter controls
	const debouncedFetch = useCallback(debounce(fetchInsights, 300), [
		fetchInsights,
	]);

	// Effect to fetch data when filters or page change
	useEffect(() => {
		// When filters change, reset to page 1
		if (page !== 1) {
			setPage(1);
		}
		debouncedFetch(filters, page);
	}, [filters, debouncedFetch]);

	// Fetch when page changes directly
	useEffect(() => {
		fetchInsights(filters, page);
	}, [page]);

	return {
		insights,
		filters,
		setFilters,
		allTags,
		isLoading,
		error,
		// Pagination data and controls
		page,
		setPage,
		totalPages,
		totalCount,
	};
};
