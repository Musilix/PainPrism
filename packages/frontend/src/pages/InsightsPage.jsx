import React from 'react';
import { Link } from 'react-router-dom';
import InsightsTable from '../components/InsightsTable.jsx';
import Pagination from '../components/Pagination.jsx';
import { useInsights } from '../hooks/useInsights.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { SparkleIcon } from '../components/Icons.jsx';

const InsightsPage = () => {
	const { isLoggedIn } = useAuth();
	const {
		insights,
		filters,
		setFilters,
		allTags,
		isLoading,
		error,
		page,
		setPage,
		totalPages,
	} = useInsights();

	const GUEST_PAGE_LIMIT = 3;
	const effectiveTotalPages = isLoggedIn
		? totalPages
		: Math.min(totalPages, GUEST_PAGE_LIMIT);

	const handlePageChange = (newPage) => {
		if (!isLoggedIn && newPage > GUEST_PAGE_LIMIT) return;
		setPage(newPage);
	};

	return (
		<div className='flex flex-col items-center w-full'>
			<div className='w-full max-w-7xl mx-auto'>
				<div className='sm:flex sm:items-center my-8'>
					<div className='sm:flex-auto'>
						<h1 className='text-2xl font-bold leading-6 text-stone-900'>
							Insights
						</h1>
						<p className='mt-2 text-sm text-stone-600'>
							A list of all the user pain points and product
							yearnings found in our database.
						</p>
					</div>
				</div>

				{/* The Table now contains the filters */}
				<div className='mt-4 flow-root'>
					<div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
						<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
							{isLoading && (
								<div className='text-center py-10'>
									<p>Loading insights...</p>
								</div>
							)}
							{error && (
								<div className='text-center py-10 text-red-500'>
									<p>Error: {error.message}</p>
								</div>
							)}
							{!isLoading && !error && (
								<div className='border border-stone-200/80 rounded-2xl shadow-sm'>
									<InsightsTable
										insights={insights}
										filters={filters}
										setFilters={setFilters}
										allTags={allTags}
									/>
									<Pagination
										currentPage={page}
										totalPages={effectiveTotalPages}
										onPageChange={handlePageChange}
									/>
								</div>
							)}
							{!isLoggedIn &&
								page >= GUEST_PAGE_LIMIT &&
								totalPages > GUEST_PAGE_LIMIT && (
									<div className='mt-8 text-center p-8 bg-gradient-to-br from-amber-50 via-white to-violet-50 border border-stone-200 rounded-2xl shadow-lg'>
										<div className='flex justify-center items-center mx-auto w-12 h-12 bg-amber-100 rounded-full border-4 border-white'>
											<SparkleIcon className='h-6 w-6 text-amber-600' />
										</div>
										<h3 className='mt-4 text-xl font-bold text-stone-800'>
											Unlock the Full Feed
										</h3>
										<p className='mt-2 text-stone-600 max-w-md mx-auto'>
											You've reached the end of the public
											preview. Create a free account to
											browse all insights.
										</p>
										<Link
											to='/register'
											className='mt-6 inline-block bg-amber-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-amber-700 transition-colors shadow-md hover:shadow-lg'
										>
											Sign Up - It's Free
										</Link>
									</div>
								)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InsightsPage;
