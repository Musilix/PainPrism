import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';
import { DateRangePicker } from './DateRangePicker'; // Import our new component

const FilterControls = ({ filters, setFilters, allTags }) => {
	const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
	const tagPopoverRef = useRef(null);
	const isProUser = false; // Placeholder for real auth state

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				tagPopoverRef.current &&
				!tagPopoverRef.current.contains(event.target)
			)
				setIsTagPopoverOpen(false);
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const handleDateUpdate = (dateRange) => {
		setFilters((prev) => ({ ...prev, dateRange }));
	};

	const handleTagSelect = (tag) => {
		handleFilterChange('tag', tag);
		setIsTagPopoverOpen(false);
	};

	return (
		<div className='relative z-20 flex flex-wrap justify-center items-center gap-2 md:gap-4 mb-10 p-2 bg-white/50 backdrop-blur-sm rounded-full shadow-sm border border-stone-200 max-w-fit mx-auto'>
			<div className='flex items-center gap-1 p-1'>
				<button
					onClick={() => handleFilterChange('type', 'all')}
					className={`px-4 py-2 text-sm font-semibold rounded-full ${
						filters.type === 'all'
							? 'bg-amber-600 text-white shadow-sm'
							: 'hover:bg-stone-100 text-stone-700'
					}`}
				>
					All
				</button>
				<button
					onClick={() => handleFilterChange('type', 'pain-point')}
					className={`px-4 py-2 text-sm font-semibold rounded-full ${
						filters.type === 'pain-point'
							? 'bg-amber-600 text-white shadow-sm'
							: 'hover:bg-stone-100 text-stone-700'
					}`}
				>
					Pain Points
				</button>
				<button
					onClick={() =>
						handleFilterChange('type', 'product-yearning')
					}
					className={`px-4 py-2 text-sm font-semibold rounded-full ${
						filters.type === 'product-yearning'
							? 'bg-amber-600 text-white shadow-sm'
							: 'hover:bg-stone-100 text-stone-700'
					}`}
				>
					Yearnings
				</button>
			</div>
			<div className='h-6 w-px bg-stone-200 hidden md:block'></div>
			<div className='flex items-center gap-2 p-1'>
				<DateRangePicker
					onUpdate={handleDateUpdate}
					initialRange={filters.dateRange}
				/>
				<div
					className='relative'
					ref={tagPopoverRef}
				>
					<button
						onClick={() => setIsTagPopoverOpen((p) => !p)}
						className='bg-white border-none text-stone-700 text-sm font-semibold rounded-full py-2 px-4 hover:bg-stone-100 transition-colors h-10 flex items-center'
					>
						{filters.tag === 'all' ? 'All Tags' : filters.tag}
						<ChevronDownIcon />
					</button>
					{isTagPopoverOpen && (
						<div className='absolute top-full mt-2 bg-white border border-stone-200 rounded-lg shadow-xl w-48 right-0 md:right-auto overflow-hidden'>
							<div className='max-h-60 overflow-y-auto p-2'>
								{allTags.map((tag) => (
									<button
										key={tag}
										onClick={() => handleTagSelect(tag)}
										className={`w-full text-left rounded-md p-2 text-sm ${
											filters.tag === tag
												? 'bg-amber-100 text-amber-800'
												: 'text-stone-700 hover:bg-stone-100'
										}`}
									>
										{tag === 'all' ? 'All Tags' : tag}
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
			{isProUser && (
				<>
					<div className='h-6 w-px bg-stone-200 hidden md:block'></div>
					<button className='px-4 py-2 text-sm font-semibold rounded-full bg-violet-600 text-white shadow-sm hover:bg-violet-700'>
						View Clusters
					</button>
				</>
			)}
		</div>
	);
};

export default FilterControls;
