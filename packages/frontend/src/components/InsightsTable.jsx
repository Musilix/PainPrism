import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { format, parse, parseISO, isValid } from 'date-fns';
import { ChevronDownIcon, FlameIcon, SparkleIcon, SproutIcon } from './Icons';

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

const parseInitialRange = (r) => {
	if (!r) return undefined;
	const from = r.start && isValid(parseISO(r.start)) ? parseISO(r.start) : undefined;
	const to = r.end && isValid(parseISO(r.end)) ? parseISO(r.end) : undefined;
	if (!from && !to) return undefined;
	return { from, to };
};

const tryParseDate = (str) => {
	if (!str || !str.trim()) return null;
	const s = str.trim();
	if (isValid(parseISO(s))) return parseISO(s);
	const p = parse(s, 'MMM d, yyyy', new Date());
	if (isValid(p)) return p;
	const p2 = parse(s, 'M/d/yyyy', new Date());
	return isValid(p2) ? p2 : null;
};

const DateRangePicker = ({ onUpdate, initialRange }) => {
	const [range, setRange] = useState(() => parseInitialRange(initialRange));
	const [fromInput, setFromInput] = useState('');
	const [toInput, setToInput] = useState('');
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

	useEffect(() => {
		if (isOpen) setRange((prev) => prev ?? parseInitialRange(initialRange));
	}, [isOpen, initialRange?.start, initialRange?.end]);

	useEffect(() => {
		if (range?.from) setFromInput(format(range.from, 'MMM d, yyyy'));
		else setFromInput('');
		if (range?.to) setToInput(format(range.to, 'MMM d, yyyy'));
		else setToInput('');
	}, [range?.from, range?.to]);

	const handleSelect = (selectedRange) => {
		setRange(selectedRange);
	};

	const handleFromBlur = () => {
		const d = tryParseDate(fromInput);
		if (d) setRange((prev) => ({ from: d, to: prev?.to ?? undefined }));
	};

	const handleToBlur = () => {
		const d = tryParseDate(toInput);
		if (d) setRange((prev) => ({ from: prev?.from ?? d, to: d }));
	};

	const handleConfirm = (e) => {
		e.stopPropagation();
		onUpdate({
			start: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
			end: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
		});
		setIsOpen(false);
	};

	const handleClear = (e) => {
		e.stopPropagation();
		setRange(undefined);
		onUpdate({ start: '', end: '' });
		setIsOpen(false);
	};

	const displayDateRange = () => {
		if (range?.from) {
			if (!range.to) return `${format(range.from, 'MMM d')} – …`;
			return `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d')}`;
		}
		return 'Dates';
	};

	const hasRange = range?.from != null;

	const pickerClassNames = {
		root: 'text-stone-800',
		months: 'flex justify-center',
		month: 'space-y-2',
		month_caption: 'relative flex justify-center items-center h-8',
		caption_label: 'text-xs font-semibold text-stone-800',
		button_previous: 'absolute left-0 h-7 w-7 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 text-stone-700',
		button_next: 'absolute right-0 h-7 w-7 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 text-stone-700',
		month_grid: 'w-full border-collapse',
		weekdays: 'flex',
		weekday: 'text-stone-500 text-[10px] font-medium w-8 flex items-center justify-center',
		week: 'flex w-full',
		day: 'w-8 h-8 p-0 text-xs',
		day_button: 'h-8 w-8 rounded-full flex items-center justify-center font-medium hover:bg-stone-100 transition-colors',
		selected: '!bg-amber-600 !text-white hover:!bg-amber-700',
		today: 'text-amber-600 font-semibold',
		outside: 'text-stone-300',
		disabled: 'text-stone-300 cursor-not-allowed hover:bg-transparent',
		range_start: '!bg-amber-600 !text-white rounded-l-full',
		range_end: '!bg-amber-600 !text-white rounded-r-full',
		range_middle: '!bg-amber-100 !text-amber-900',
	};

	return (
		<div className='relative' ref={popoverRef}>
			<button
				type='button'
				onClick={() => setIsOpen((prev) => !prev)}
				className='w-full bg-white border border-stone-200/80 text-stone-700 text-xs font-semibold rounded-full py-1.5 px-3 hover:bg-stone-50 transition-colors flex items-center justify-between gap-1'
			>
				<span className='truncate'>{displayDateRange()}</span>
				<ChevronDownIcon />
			</button>
			{isOpen && (
				<div className='absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-2xl shadow-xl z-20 p-3 w-[min(300px,90vw)]'>
					<div className='flex items-center justify-between mb-2'>
						<span className='text-xs font-semibold text-stone-800'>Date range</span>
						{hasRange && (
							<button
								type='button'
								onClick={handleClear}
								className='text-[10px] font-medium text-stone-500 hover:text-amber-600'
							>
								Clear
							</button>
						)}
					</div>
					<div className='grid grid-cols-2 gap-1.5 mb-2'>
						<div>
							<label className='block text-[10px] font-medium text-stone-500 mb-0.5'>From</label>
							<input
								type='text'
								placeholder='e.g. Mar 1, 2025'
								className='w-full rounded-lg border border-stone-200 px-2 py-1 text-xs text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none'
								value={fromInput}
								onChange={(e) => setFromInput(e.target.value)}
								onBlur={handleFromBlur}
							/>
						</div>
						<div>
							<label className='block text-[10px] font-medium text-stone-500 mb-0.5'>To</label>
							<input
								type='text'
								placeholder='e.g. Mar 15, 2025'
								className='w-full rounded-lg border border-stone-200 px-2 py-1 text-xs text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none'
								value={toInput}
								onChange={(e) => setToInput(e.target.value)}
								onBlur={handleToBlur}
							/>
						</div>
					</div>
					<DayPicker
						mode='range'
						selected={range}
						onSelect={handleSelect}
						showOutsideDays
						classNames={pickerClassNames}
					/>
					<div className='flex justify-end mt-2 pt-2 border-t border-stone-100'>
						<button
							type='button'
							onClick={handleConfirm}
							className='px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors'
						>
							Confirm
						</button>
					</div>
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
	showUpgradePrompt = false,
}) => {
	const navigate = useNavigate();
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
							<td colSpan='5' className='p-0'>
								{showUpgradePrompt ? (
									<div className='text-center p-8 mx-4 my-6 bg-gradient-to-br from-amber-50 via-white to-violet-50 border border-stone-200 rounded-2xl shadow-lg'>
										<div className='flex justify-center items-center mx-auto w-12 h-12 bg-amber-100 rounded-full border-4 border-white'>
											<SparkleIcon className='h-6 w-6 text-amber-600' />
										</div>
										<h3 className='mt-4 text-xl font-bold text-stone-800'>
											You've reached the free preview limit
										</h3>
										<p className='mt-2 text-stone-600 max-w-md mx-auto'>
											Upgrade to Pro to browse all insights and go beyond page 3.
										</p>
										<Link
											to='/pricing'
											className='mt-6 inline-block bg-amber-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-amber-700 transition-colors shadow-md hover:shadow-lg'
										>
											View Pro
										</Link>
									</div>
								) : (
									<div className='text-center py-16 px-6 text-stone-500'>
										<h3 className='text-lg font-semibold text-stone-800'>No insights found</h3>
										<p className='mt-1'>Try adjusting your filters.</p>
									</div>
								)}
							</td>
						</tr>
					) : (
						insights.map((insight) => {
							const style = typeStyles[insight.type] || {};
							const sourceUrl = insight.sourceUrl || (insight.sourceCommentId ? `https://news.ycombinator.com/item?id=${insight.sourceCommentId}` : null);
							return (
								<tr
									key={insight.id}
									role='button'
									tabIndex={0}
									onClick={() => navigate(`/insights/${insight.id}`)}
									onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/insights/${insight.id}`); } }}
									className='hover:bg-stone-50/80 cursor-pointer'
								>
									<td className='w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-stone-900 sm:w-auto sm:max-w-none sm:pl-6'>
										<p className='font-medium text-stone-800'>
											{insight.subject_description || insight.text}
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
										{sourceUrl ? (
										<a
											href={sourceUrl}
											target='_blank'
											rel='noopener noreferrer'
											onClick={(e) => e.stopPropagation()}
											className='text-amber-600 hover:text-amber-800'
										>
											Source
											<span className='sr-only'>
												, {insight.subject_description || insight.text}
											</span>
										</a>
										) : (
											<span className='text-stone-400'>—</span>
										)}
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
