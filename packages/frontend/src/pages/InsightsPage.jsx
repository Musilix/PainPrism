import React from 'react';
import InsightsTable from '../components/InsightsTable.jsx';
import Pagination from '../components/Pagination.jsx';
import { useInsights } from '../hooks/useInsights.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const InsightsPage = () => {
	const { isProUser } = useAuth();
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
		totalCount,
	} = useInsights();

	const PAGE_LIMIT_FREE = 3;
	const showUpgradePrompt =
		!isProUser &&
		page > PAGE_LIMIT_FREE &&
		totalCount > 0 &&
		insights.length === 0;

	const handlePageChange = (newPage) => {
		setPage(newPage);
	};

	return (
		<div className='flex flex-col items-center w-full'>
			<div className='w-full max-w-7xl mx-auto'>
				<div className='sm:flex sm:items-center my-8'>
					<div className='mx-4 my-2 sm:flex-auto'>
						<h1 className='text-3xl font-bold leading-6 text-stone-900'>
							Insights
						</h1>
						<p className='mt-2 text-sm text-stone-600'>
							A list of all the user pain points and product
							yearnings found in our database.
						</p>
					</div>
				</div>

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
										showUpgradePrompt={showUpgradePrompt}
									/>
									<Pagination
										currentPage={page}
										totalPages={totalPages}
										onPageChange={handlePageChange}
										nextDisabled={!isProUser && page > PAGE_LIMIT_FREE}
									/>
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
