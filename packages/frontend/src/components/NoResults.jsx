import React from 'react';

const NoResults = () => (
	<div className='text-center py-16 px-6 bg-white/50 rounded-lg border border-dashed border-stone-300'>
		<svg
			className='mx-auto h-12 w-12 text-stone-400'
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-hidden='true'
		>
			<path
				vectorEffect='non-scaling-stroke'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z'
			/>
		</svg>
		<h3 className='mt-2 text-sm font-semibold text-stone-800'>
			No insights found
		</h3>
		<p className='mt-1 text-sm text-stone-500'>
			Try adjusting your date or filters.
		</p>
	</div>
);

export default NoResults;
