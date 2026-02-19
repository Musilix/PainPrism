import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ChevronDownIcon, FlameIcon, SproutIcon } from './Icons';

// --- INLINED DEPENDENCIES TO PREVENT ERRORS ---
const formatDate = (isoDate) => {
	if (!isoDate) return 'N/A';
	const date = new Date(isoDate);
	const correctedDate = new Date(
		date.getTime() + date.getTimezoneOffset() * 60000
	);
	return correctedDate.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const DateRangePicker = ({ onUpdate, initialRange }) => {
	const [range, setRange] = useState(initialRange);
	const [isOpen, setIsOpen] = useState(false);
	const popoverRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(event.target)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSelect = (selectedRange) => {
		setRange(selectedRange);
		onUpdate({
			start: selectedRange?.from
				? format(selectedRange.from, 'yyyy-MM-dd')
				: '',
			end: selectedRange?.to
				? format(selectedRange.to, 'yyyy-MM-dd')
				: '',
		});
		if (selectedRange?.from && selectedRange?.to) {
			setIsOpen(false);
		}
	};

	const displayDateRange = () => {
		if (range?.from) {
			if (!range.to) return `From ${format(range.from, 'MMM d')}`;
			return `${format(range.from, 'MMM d')} - ${format(
				range.to,
				'MMM d'
			)}`;
		}
		return 'Select Date';
	};

	return (
		<div
			className='relative'
			ref={popoverRef}
		>
			<button
				onClick={() => setIsOpen((prev) => !prev)}
				className='w-full bg-white border border-stone-300 text-stone-700 text-xs font-medium rounded-md py-1.5 px-3 hover:bg-stone-50 transition-colors flex items-center justify-between'
			>
				<span className='truncate'>{displayDateRange()}</span>
				<ChevronDownIcon />
			</button>
			{isOpen && (
				<div className='absolute top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-xl z-20 p-2'>
					<DayPicker
						mode='range'
						selected={range}
						onSelect={handleSelect}
						showOutsideDays
						classNames={{
							root: 'text-sm',
							caption:
								'flex justify-center py-2 mb-2 relative items-center',
							caption_label: 'font-semibold',
							nav_button_previous: 'absolute left-1',
							nav_button_next: 'absolute right-1',
							day_today: 'text-amber-600 font-bold',
							day_selected:
								'bg-amber-600 text-white rounded-full',
							day_range_middle: 'bg-amber-100 text-amber-900',
						}}
					/>
				</div>
			)}
		</div>
	);
};

const typeStyles = {
	'pain-point': {
		label: 'Pain Point',
		Icon: FlameIcon,
		bgColor: 'bg-purple-100',
		textColor: 'text-purple-800',
	},
	'product-yearning': {
		label: 'Product Yearning',
		Icon: SproutIcon,
		bgColor: 'bg-emerald-100',
		textColor: 'text-emerald-800',
	},
};

const InsightsTable = ({
	insights,
	filters,
	setFilters,
	allTags,
	sort = { sortBy: 'date', sortOrder: 'desc' },
	setSort = () => {},
	isLoading = false,
}) => {
	const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false);
	const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
	const typePopoverRef = useRef(null);
	const tagPopoverRef = useRef(null);

	// Unified popover closing logic
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				typePopoverRef.current &&
				!typePopoverRef.current.contains(event.target)
			) {
				setIsTypePopoverOpen(false);
			}
			if (
				tagPopoverRef.current &&
				!tagPopoverRef.current.contains(event.target)
			) {
				setIsTagPopoverOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleTypeSelect = (type) => {
		setFilters((prev) => ({ ...prev, type: type }));
		setIsTypePopoverOpen(false);
	};

	const handleTagToggle = (tag) => {
		setFilters((prev) => {
			const currentTags = prev.tags || [];
			const newTags = currentTags.includes(tag)
				? currentTags.filter((t) => t !== tag)
				: [...currentTags, tag];
			return { ...prev, tags: newTags };
		});
	};

	const handleDateUpdate = (dateRange) => {
		setFilters((prev) => ({ ...prev, dateRange }));
	};

	const handleSort = (column) => {
		const isCurrentColumn = sort.sortBy === column;
		const newSortOrder =
			isCurrentColumn && sort.sortOrder === 'desc' ? 'asc' : 'desc';
		setSort({ sortBy: column, sortOrder: newSortOrder });
	};

	const getSortIndicator = (column) => {
		if (sort.sortBy !== column) return '▲▼';
		return sort.sortOrder === 'desc' ? '▼' : '▲';
	};

	const typeOptions = [
		{ value: 'all', label: 'All Types' },
		{ value: 'pain-point', label: 'Pain Point' },
		{ value: 'product-yearning', label: 'Yearning' },
	];

	return (
		<div className='relative overflow-hidden'>
			{isLoading && (
				<div className='absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex items-center justify-center'>
					<p className='text-stone-600 font-semibold'>
						Fetching insights...
					</p>
				</div>
			)}
			<table className='min-w-full divide-y divide-stone-200'>
				<thead className='bg-stone-50/80'>
					<tr>
						<th
							scope='col'
							className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-stone-900 sm:pl-6'
						>
							Insight
						</th>
						<th
							scope='col'
							className='hidden px-3 py-3.5 text-left text-sm font-semibold text-stone-900 lg:table-cell'
						>
							<div className='flex flex-col gap-1'>
								<span>Type</span>
								<div
									className='relative'
									ref={typePopoverRef}
								>
									<button
										onClick={() =>
											setIsTypePopoverOpen((p) => !p)
										}
										className='w-full bg-white border border-stone-300 text-stone-700 text-xs font-medium rounded-md py-1.5 px-3 hover:bg-stone-50 transition-colors flex items-center justify-between'
									>
										<span className='truncate'>
											{
												typeOptions.find(
													(opt) =>
														opt.value ===
														filters.type
												)?.label
											}
										</span>
										<ChevronDownIcon />
									</button>
									{isTypePopoverOpen && (
										<div className='absolute top-full mt-1 bg-white border border-stone-200 rounded-md shadow-lg w-40 z-10'>
											<div className='p-1'>
												{typeOptions.map((opt) => (
													<button
														key={opt.value}
														onClick={() =>
															handleTypeSelect(
																opt.value
															)
														}
														className={`w-full text-left rounded p-2 text-xs ${
															filters.type ===
															opt.value
																? 'bg-amber-100 text-amber-800'
																: 'text-stone-700 hover:bg-stone-100'
														}`}
													>
														{opt.label}
													</button>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</th>
						<th
							scope='col'
							className='hidden px-3 py-3.5 text-left text-sm font-semibold text-stone-900 sm:table-cell'
						>
							<div className='flex flex-col gap-1'>
								<span>Tags</span>
								<div
									className='relative'
									ref={tagPopoverRef}
								>
									<button
										onClick={() =>
											setIsTagPopoverOpen((p) => !p)
										}
										className='w-full bg-white border border-stone-300 text-stone-700 text-xs font-medium rounded-md py-1.5 px-3 hover:bg-stone-50 transition-colors flex items-center justify-between'
									>
										<span className='truncate'>
											{(filters.tags || []).length === 0
												? 'All Tags'
												: `${
														(filters.tags || [])
															.length
												  } selected`}
										</span>
										<ChevronDownIcon />
									</button>
									{isTagPopoverOpen && (
										<div className='absolute top-full mt-1 bg-white border border-stone-200 rounded-md shadow-lg w-48 z-10'>
											<div className='max-h-60 overflow-y-auto p-1'>
												{allTags
													.filter((t) => t !== 'all')
													.map((tag) => (
														<label
															key={tag}
															className='flex items-center gap-2 p-2 rounded hover:bg-stone-100 cursor-pointer'
														>
															<input
																type='checkbox'
																checked={(
																	filters.tags ||
																	[]
																).includes(tag)}
																onChange={() =>
																	handleTagToggle(
																		tag
																	)
																}
																className='h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500'
															/>
															<span className='text-xs text-stone-700'>
																{tag}
															</span>
														</label>
													))}
											</div>
										</div>
									)}
								</div>
							</div>
						</th>
						<th
							scope='col'
							className='hidden px-3 py-3.5 text-left text-sm font-semibold text-stone-900 lg:table-cell'
						>
							<div className='flex flex-col gap-1'>
								<button
									onClick={() => handleSort('date')}
									className='flex items-center gap-1 font-semibold text-sm'
								>
									Date
									<span className='text-stone-400'>
										{getSortIndicator('date')}
									</span>
								</button>
								<DateRangePicker
									onUpdate={handleDateUpdate}
									initialRange={filters.dateRange}
								/>
							</div>
						</th>
						<th
							scope='col'
							className='relative py-3.5 pl-3 pr-4 sm:pr-6'
						>
							<span className='sr-only'>View Source</span>
						</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-stone-100 bg-white'>
					{!isLoading && insights.length === 0 ? (
						<tr>
							<td
								colSpan='5'
								className='text-center py-16 px-6 text-stone-500'
							>
								<h3 className='text-lg font-semibold text-stone-800'>
									No insights found
								</h3>
								<p className='mt-1'>
									Try adjusting your filters.
								</p>
							</td>
						</tr>
					) : (
						insights.map((insight) => {
							const style = typeStyles[insight.type] || {};
							const sourceUrl = `https://news.ycombinator.com/item?id=${insight.sourceCommentId}`;
							return (
								<tr
									key={insight.id}
									className='hover:bg-stone-50/80'
								>
									<td className='w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-stone-900 sm:w-auto sm:max-w-none sm:pl-6'>
										<p className='font-medium text-stone-800'>
											{insight.text}
										</p>
										<p className='mt-1 text-stone-500 lg:hidden'>
											{style.label}
										</p>
									</td>
									<td className='hidden px-3 py-4 text-sm text-stone-500 lg:table-cell'>
										<span
											className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${style.bgColor} ${style.textColor}`}
										>
											{style.label}
										</span>
									</td>
									<td className='hidden px-3 py-4 text-sm text-stone-500 sm:table-cell'>
										<div className='flex flex-wrap gap-1'>
											{(insight.tags || [])
												.slice(0, 2)
												.map((tag) => (
													<span
														key={tag}
														className='inline-flex items-center rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700'
													>
														{tag}
													</span>
												))}
										</div>
									</td>
									<td className='hidden px-3 py-4 text-sm text-stone-500 lg:table-cell'>
										{formatDate(insight.date)}
									</td>
									<td className='py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
										<a
											href={sourceUrl}
											target='_blank'
											rel='noopener noreferrer'
											className='text-amber-600 hover:text-amber-800'
										>
											Source
											<span className='sr-only'>
												, {insight.text}
											</span>
										</a>
									</td>
								</tr>
							);
						})
					)}
				</tbody>
			</table>
		</div>
	);
};

export default InsightsTable;
