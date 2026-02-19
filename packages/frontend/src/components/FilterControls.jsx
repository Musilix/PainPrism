import React, {
	useState,
	useRef,
	useEffect,
	useContext,
	createContext,
} from 'react';
import { Link } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
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
				className='w-full bg-white border border-stone-200/80 text-stone-700 text-sm font-semibold rounded-full py-2 px-4 hover:bg-stone-100 transition-colors h-10 flex items-center justify-between cursor-pointer'
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
