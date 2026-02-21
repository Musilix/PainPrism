import React from 'react';
import FilterControls from '../components/FilterControls.jsx';
import InsightsGrid from '../components/InsightsGrid.jsx';
import { useInsights } from '../hooks/useInsights.jsx';
import { Link } from 'react-router-dom';

const NoisyWord = ({ word }) => {
	return (
		<span className='animated-noise'>
			{word.split('').map((char, index) => (
				<span
					key={index}
					style={{ '--i': Math.random() }}
				>
					{char}
				</span>
			))}
		</span>
	);
};

const HomePage = () => {
	const { insights, filters, setFilters, allTags, isLoading, error } =
		useInsights({ limit: 6 });

	return (
		<div className='flex flex-col items-center w-full'>
			<div className='text-center my-16 px-4 relative'>
				<h1 className='text-5xl font-extrabold tracking-tighter text-stone-900 sm:text-6xl md:text-7xl'>
					Clarity Through <NoisyWord word='Noise' />
				</h1>
				<p className='mt-6 text-lg text-stone-600 max-w-2xl mx-auto'>
					An endlessly updating feed of user pain points and product
					yearnings, scraped from the web's most insightful
					communities.
				</p>
			</div>

			<div className='mb-10'>
				<FilterControls
					filters={filters}
					setFilters={setFilters}
					allTags={allTags}
				/>
			</div>

			<div className='w-full'>
				{isLoading && (
					<>
						<p className='text-center text-sm text-stone-400 mb-6'>
							Loading insights…
						</p>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div
								key={i}
								className='bg-white border border-stone-200/80 rounded-2xl shadow-md overflow-hidden animate-pulse'
							>
								<div className='p-4 sm:p-5 border-b border-stone-100'>
									<div className='h-5 bg-stone-200 rounded w-3/4 mb-3' />
									<div className='h-6 bg-stone-100 rounded-full w-28' />
								</div>
								<div className='p-4 sm:p-5 space-y-2'>
									<div className='h-3 bg-stone-100 rounded w-full' />
									<div className='h-3 bg-stone-100 rounded w-full' />
									<div className='h-3 bg-stone-100 rounded w-5/6' />
								</div>
								<div className='p-4 sm:p-5 bg-stone-50/70 border-t border-stone-100'>
									<div className='h-3 bg-amber-100/60 rounded w-24' />
								</div>
							</div>
						))}
						</div>
					</>
				)}
				{error && (
					<div className='text-center py-10 text-red-500'>
						<p>Error: {error.message}</p>
					</div>
				)}
				{!isLoading && !error && (
					<InsightsGrid
						insights={insights}
						cardSize='medium'
					/>
				)}

				{!isLoading && insights.length > 0 && (
					<div className='text-center mt-12'>
						<Link
							to='/insights'
							className='inline-block bg-amber-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer'
						>
							View All Insights
						</Link>
					</div>
				)}
			</div>
		</div>
	);
};

export default HomePage;
