import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FilterControls from './components/FilterControls';
import InsightsGrid from './components/InsightsGrid';
import { useInsights } from './hooks/useInsights';

export default function App() {
	const { filteredInsights, filters, setFilters, allTags } = useInsights();

	return (
		<div className='min-h-screen bg-stone-50 font-sans text-stone-800'>
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				<Header />
				<FilterControls
					filters={filters}
					setFilters={setFilters}
					allTags={allTags}
				/>
				<InsightsGrid insights={filteredInsights} />
			</main>
			<Footer />
		</div>
	);
}
