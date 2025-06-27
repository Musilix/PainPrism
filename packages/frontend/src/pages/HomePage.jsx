import React from 'react';
import FilterControls from '../components/FilterControls';
import InsightsGrid from '../components/InsightsGrid';
import { useInsights } from '../hooks/useInsights';

const HomePage = () => {
	const { filteredInsights, filters, setFilters, allTags } = useInsights();

	return (
		<div className='flex flex-col items-center w-full'>
			{/* Centered Hero Section */}
			<div className='text-center my-12'>
				<h1 className='text-4xl font-bold tracking-tight text-stone-800 sm:text-5xl'>
					Clarity Through Noise
				</h1>
				<p className='mt-4 text-lg text-stone-500 max-w-2xl mx-auto'>
					An endlessly updating feed of user pain points and product
					yearnings, scraped from the web's most insightful
					communities.
				</p>
			</div>

			{/* Centered Filter Controls Container (Sticky) */}
			<div className='w-full sticky top-[65px] z-30 py-4 bg-stone-50/80 backdrop-blur-sm flex justify-center'>
				<FilterControls
					filters={filters}
					setFilters={setFilters}
					allTags={allTags}
				/>
			</div>

			{/* Main Content Grid */}
			<div className='w-full mt-8'>
				<InsightsGrid insights={filteredInsights} />
			</div>
		</div>
	);
};

export default HomePage;