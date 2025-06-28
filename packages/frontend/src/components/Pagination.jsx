import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	const handlePrevious = () => {
		onPageChange(Math.max(1, currentPage - 1));
	};

	const handleNext = () => {
		onPageChange(Math.min(totalPages, currentPage + 1));
	};

	if (totalPages <= 1) {
		return null;
	}

	return (
		<nav
			className='flex items-center justify-between border-t border-stone-200 bg-white px-4 py-3 sm:px-6 rounded-b-2xl'
			aria-label='Pagination'
		>
			<div className='hidden sm:block'>
				<p className='text-sm text-stone-700'>
					Page <span className='font-medium'>{currentPage}</span> of{' '}
					<span className='font-medium'>{totalPages}</span>
				</p>
			</div>
			<div className='flex flex-1 justify-between sm:justify-end'>
				<button
					onClick={handlePrevious}
					disabled={currentPage === 1}
					className='relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-stone-900 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
				>
					Previous
				</button>
				<button
					onClick={handleNext}
					disabled={currentPage === totalPages}
					className='relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-stone-900 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
				>
					Next
				</button>
			</div>
		</nav>
	);
};

export default Pagination;
