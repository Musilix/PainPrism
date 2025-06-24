import { useState, useMemo } from 'react';
import { mockInsights } from '../data/mockData';

export const useInsights = () => {
	const [filters, setFilters] = useState({
		type: 'all',
		tag: 'all',
		dateRange: { start: '', end: '' },
	});

	const allTags = useMemo(() => {
		const tags = new Set(mockInsights.flatMap((insight) => insight.tags));
		return ['all', ...Array.from(tags).sort()];
	}, [mockInsights]);

	const filteredInsights = useMemo(() => {
		return mockInsights.filter((insight) => {
			const typeMatch =
				filters.type === 'all' || insight.type === filters.type;
			const tagMatch =
				filters.tag === 'all' || insight.tags.includes(filters.tag);
			const dateMatch =
				(!filters.dateRange.start ||
					insight.date >= filters.dateRange.start) &&
				(!filters.dateRange.end ||
					insight.date <= filters.dateRange.end);
			return typeMatch && tagMatch && dateMatch;
		});
	}, [filters]);

	return {
		filteredInsights,
		filters,
		setFilters,
		allTags,
	};
};
