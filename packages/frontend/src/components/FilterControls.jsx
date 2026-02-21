import React, {
	useState,
	useRef,
	useEffect,
	useContext,
	createContext,
} from 'react';
import { Link } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { format, parse, parseISO, isValid } from 'date-fns';
// Note: To ensure the date picker styles load correctly,
// please add the following import to your global CSS file (e.g., src/index.css):
// @import 'react-day-picker/dist/style.css';

// --- INLINED DEPENDENCIES TO PREVENT BUILD ERRORS ---

const AuthContext = createContext(null);
const useAuth = () => {
	// Provide a default/mock value for rendering in isolation
	return useContext(AuthContext) || { isProUser: false };
};

const ChevronDownIcon = () => (
	<svg
		className='h-5 w-5 ml-2 -mr-1 text-stone-400'
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 20 20'
		fill='currentColor'
		aria-hidden='true'
	>
		<path
			fillRule='evenodd'
			d='M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z'
			clipRule='evenodd'
		/>
	</svg>
);

const CalendarIcon = () => (
	<svg className='h-4 w-4 text-stone-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
		<path strokeLinecap='round' strokeLinejoin='round' d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' />
	</svg>
);

const parseInitialRange = (r) => {
	if (!r) return undefined;
	const from = r.start && isValid(parseISO(r.start)) ? parseISO(r.start) : undefined;
	const to = r.end && isValid(parseISO(r.end)) ? parseISO(r.end) : undefined;
	if (!from && !to) return undefined;
	return { from, to };
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

	const tryParseDate = (str) => {
		if (!str || !str.trim()) return null;
		const s = str.trim();
		const iso = parseISO(s);
		if (isValid(iso)) return iso;
		const parsed = parse(s, 'MMM d, yyyy', new Date());
		if (isValid(parsed)) return parsed;
		const parsed2 = parse(s, 'M/d/yyyy', new Date());
		if (isValid(parsed2)) return parsed2;
		return null;
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

	return (
		<div
			className='relative'
			ref={popoverRef}
		>
			<button
				type='button'
				onClick={() => setIsOpen((prev) => !prev)}
				className='min-w-[140px] bg-white border border-stone-200/80 text-stone-700 text-sm font-semibold rounded-full py-2 px-4 hover:bg-stone-50 hover:border-stone-300 transition-colors h-10 flex items-center justify-between gap-2 cursor-pointer shadow-sm'
			>
				<CalendarIcon />
				<span className='truncate'>{displayDateRange()}</span>
				<ChevronDownIcon />
			</button>
			{isOpen && (
				<div className='absolute top-full left-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl z-20 p-4 w-[min(320px,90vw)]'>
					<div className='flex items-center justify-between mb-3'>
						<span className='text-sm font-semibold text-stone-800'>Select range</span>
						{hasRange && (
							<button
								type='button'
								onClick={handleClear}
								className='text-xs font-medium text-stone-500 hover:text-amber-600 transition-colors'
							>
								Clear
							</button>
						)}
					</div>
					<div className='grid grid-cols-2 gap-2 mb-3'>
						<div>
							<label className='block text-[10px] font-medium text-stone-500 mb-1'>From</label>
							<input
								type='text'
								placeholder='e.g. Mar 1, 2025'
								className='w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none'
								value={fromInput}
								onChange={(e) => setFromInput(e.target.value)}
								onBlur={handleFromBlur}
							/>
						</div>
						<div>
							<label className='block text-[10px] font-medium text-stone-500 mb-1'>To</label>
							<input
								type='text'
								placeholder='e.g. Mar 15, 2025'
								className='w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none'
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
						classNames={{
							root: 'rdp-root text-stone-800',
							months: 'flex justify-center',
							month: 'space-y-3',
							month_caption: 'relative flex justify-center items-center gap-2 h-9',
							caption_label: 'text-sm font-semibold text-stone-800',
							nav: 'flex items-center gap-1',
							button_previous: 'absolute left-0 h-8 w-8 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors',
							button_next: 'absolute right-0 h-8 w-8 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors',
							month_grid: 'w-full border-collapse',
							weekdays: 'flex',
							weekday: 'text-stone-500 text-xs font-medium w-9 flex items-center justify-center',
							week: 'flex w-full',
							day: 'w-9 h-9 p-0 text-sm',
							day_button: 'h-9 w-9 rounded-full flex items-center justify-center font-medium hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:ring-offset-2',
							selected: '!bg-amber-600 !text-white hover:!bg-amber-700',
							today: 'text-amber-600 font-semibold',
							outside: 'text-stone-300',
							disabled: 'text-stone-300 cursor-not-allowed hover:bg-transparent',
							range_start: '!bg-amber-600 !text-white rounded-l-full',
							range_end: '!bg-amber-600 !text-white rounded-r-full',
							range_middle: '!bg-amber-100 !text-amber-900',
						}}
					/>
					<div className='flex justify-end gap-2 mt-3 pt-3 border-t border-stone-100'>
						<button
							type='button'
							onClick={handleConfirm}
							className='px-4 py-2 text-sm font-semibold rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors'
						>
							Confirm
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

// --- MAIN COMPONENT ---

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
		if (key === 'tag') {
			setFilters((prev) => ({
				...prev,
				tags: value === 'all' ? [] : [value],
			}));
		} else {
			setFilters((prev) => ({ ...prev, [key]: value }));
		}
	};

	const handleDateUpdate = (dateRange) => {
		setFilters((prev) => ({ ...prev, dateRange }));
	};

	const handleTagSelect = (tag) => {
		handleFilterChange('tag', tag);
		setIsTagPopoverOpen(false);
	};

	const selectedTag = (filters.tags && filters.tags[0]) || 'all';

	return (
		<div className='relative z-10 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 p-2 md:px-4 md:py-3 bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-full shadow-md border border-stone-300 w-full max-w-sm md:max-w-fit mx-auto'>
			<div className='flex items-center justify-center gap-1 p-1'>
				<button
					onClick={() => handleFilterChange('type', 'all')}
					className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 cursor-pointer ${
						filters.type === 'all'
							? 'bg-amber-600 text-white shadow-sm'
							: 'hover:bg-stone-100 text-stone-700'
					}`}
				>
					All
				</button>
				<button
					onClick={() => handleFilterChange('type', 'pain-point')}
					className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 cursor-pointer ${
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
					className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 cursor-pointer ${
						filters.type === 'product-yearning'
							? 'bg-amber-600 text-white shadow-sm'
							: 'hover:bg-stone-100 text-stone-700'
					}`}
				>
					Yearnings
				</button>
			</div>

			<div className='h-px md:h-6 w-full md:w-px bg-stone-200 hidden md:block'></div>

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
							{selectedTag === 'all' ? 'All Tags' : selectedTag}
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
												selectedTag === tag
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
