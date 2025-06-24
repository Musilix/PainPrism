import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';
import { formatDate } from '../utils/formatDate';

const FilterControls = ({ filters, setFilters, allTags }) => {
	const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
	const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
	const datePopoverRef = useRef(null);
	const tagPopoverRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				datePopoverRef.current &&
				!datePopoverRef.current.contains(event.target)
			)
				setIsDatePopoverOpen(false);
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

	const displayDateRange = () => {
		const { start, end } = filters.dateRange;
		if (start && end) {
			if (start === end) return formatDate(start);
			return `${formatDate(start)} - ${formatDate(end)}`;
		}
		if (start) return `From ${formatDate(start)}`;
		if (end) return `Up to ${formatDate(end)}`;
		return 'Select Date Range';
	};

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const handleDateRangeChange = (key, value) => {
		setFilters((prev) => ({
			...prev,
			dateRange: { ...prev.dateRange, [key]: value },
		}));
	};

	const clearDateRange = () => {
		handleFilterChange('dateRange', { start: '', end: '' });
		setIsDatePopoverOpen(false);
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
				<div
					className='relative'
					ref={datePopoverRef}
				>
					<button
						onClick={() => setIsDatePopoverOpen((p) => !p)}
						className='bg-white border-none text-stone-700 text-sm font-semibold rounded-full py-2 px-4 hover:bg-stone-100 transition-colors h-10 flex items-center'
					>
						{displayDateRange()}
						<ChevronDownIcon />
					</button>
					{isDatePopoverOpen && (
						<div className='absolute top-full mt-2 bg-white border border-stone-200 rounded-lg shadow-xl p-4 w-64 right-0 md:right-auto'>
							<div className='space-y-4'>
								<div>
									<label
										htmlFor='start-date'
										className='block text-sm font-medium text-stone-600'
									>
										Start Date
									</label>
									<input
										type='date'
										id='start-date'
										value={filters.dateRange.start}
										onChange={(e) =>
											handleDateRangeChange(
												'start',
												e.target.value
											)
										}
										className='mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm'
									/>
								</div>
								<div>
									<label
										htmlFor='end-date'
										className='block text-sm font-medium text-stone-600'
									>
										End Date
									</label>
									<input
										type='date'
										id='end-date'
										value={filters.dateRange.end}
										onChange={(e) =>
											handleDateRangeChange(
												'end',
												e.target.value
											)
										}
										className='mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm'
									/>
								</div>
							</div>
							<button
								onClick={clearDateRange}
								className='w-full mt-4 text-center px-4 py-2 text-sm font-semibold rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300'
							>
								Clear
							</button>
						</div>
					)}
				</div>
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
		</div>
	);
};

export default FilterControls;
