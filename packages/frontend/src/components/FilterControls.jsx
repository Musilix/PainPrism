import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from './Icons';
import { DateRangePicker } from './DateRangePicker';
import { useAuth } from '../context/AuthContext';

const FilterControls = ({ filters, setFilters, allTags }) => {
	const { isProUser } = useAuth();
	const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
	const tagPopoverRef = useRef(null);

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
		// --- RESPONSIVE LOGIC ---
		// Stacks vertically on mobile, goes horizontal on medium screens and up.
		// Padding and rounding are adjusted for each layout.
		<div className='relative z-10 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 p-2 md:px-4 md:py-3 bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-full shadow-md border border-stone-300 w-full max-w-sm md:max-w-fit mx-auto'>
			{/* --- Insight Type Filters --- */}
			<div className='flex items-center justify-center gap-1 p-1'>
				<button
					onClick={() => handleFilterChange('type', 'all')}
					className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 cursor-pointer ${ // <-- Added cursor-pointer
						filters.type === 'all'
							? 'bg-amber-600 text-white shadow-sm'
							: 'hover:bg-stone-100 text-stone-700'
					}`}
				>
					All
				</button>
				<button
					onClick={() => handleFilterChange('type', 'pain-point')}
					className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 cursor-pointer ${ // <-- Added cursor-pointer
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
					className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 cursor-pointer ${ // <-- Added cursor-pointer
						filters.type === 'product-yearning'
							? 'bg-amber-600 text-white shadow-sm'
							: 'hover:bg-stone-100 text-stone-700'
					}`}
				>
					Yearnings
				</button>
			</div>

			{/* --- Decorative divider, hidden on mobile --- */}
			<div className='h-px md:h-6 w-full md:w-px bg-stone-200 hidden md:block'></div>

			{/* --- Pro Feature & Secondary Filters --- */}
			<div className='flex flex-col sm:flex-row items-center gap-2'>
				<div className='flex items-center gap-2 w-full sm:w-auto'>
					<DateRangePicker
						onUpdate={handleDateUpdate}
						initialRange={filters.dateRange}
					/>
					<div
						className='relative cursor-pointer'
						ref={tagPopoverRef}
					>
						<button
							onClick={() => setIsTagPopoverOpen((p) => !p)}
							className='w-full bg-white border border-stone-200/80 text-stone-700 text-sm font-semibold rounded-full py-2 px-4 hover:bg-stone-100 transition-colors h-10 flex items-center justify-between cursor-pointer'
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
											{tag === 'all'
												? 'All Tags'
												: tag}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			
			{/* --- Decorative divider, hidden on mobile --- */}
			<div className='h-px md:h-6 w-full md:w-px bg-stone-200 hidden md:block'></div>
			{isProUser ? (
					<button className='w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-full bg-violet-600 text-white shadow-sm hover:bg-violet-700'>
						View Clusters
					</button>
				) : (
					<Link
						to='/pricing'
						className='w-full sm:w-auto text-center px-4 py-2 text-sm font-semibold rounded-full bg-stone-200 text-stone-700 shadow-sm hover:bg-stone-300 transition-colors'
					>
						✨ View Trends
					</Link>
				)}
		</div>
	);
};

export default FilterControls;

