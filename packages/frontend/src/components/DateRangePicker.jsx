import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { ChevronDownIcon } from './Icons';

export const DateRangePicker = ({ onUpdate, initialRange }) => {
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
		console.log(JSON.stringify(selectedRange));
		setRange(selectedRange);
		onUpdate({
			start: selectedRange?.from
				? format(selectedRange.from, 'yyyy-MM-dd')
				: '',
			end: selectedRange?.to
				? format(selectedRange.to, 'yyyy-MM-dd')
				: '',
		});
		// Close the popover after a range is selected
		// if (
		// 	selectedRange.to &&
		// 	selectedRange.from &&
		// 	selectedRange.to !== selectedRange.from
		// ) {
		// 	setIsOpen(false);
		// }
	};

	const displayDateRange = () => {
		if (range?.from) {
			if (!range.to) return `From ${format(range.from, 'MMM d, yyyy')}`;
			return `${format(range.from, 'MMM d, yyyy')} - ${format(
				range.to,
				'MMM d, yyyy'
			)}`;
		}
		return 'Select Date Range';
	};

	return (
		<div
			className='relative'
			ref={popoverRef}
		>
			<button
				onClick={() => setIsOpen((prev) => !prev)}
				className='bg-white border-none text-stone-700 text-sm font-semibold rounded-full py-2 px-4 hover:bg-stone-100 transition-colors h-10 flex items-center'
			>
				{displayDateRange()}
				<ChevronDownIcon />
			</button>
			{isOpen && (
				<div className='absolute top-full mt-2 bg-white border border-stone-200 rounded-lg shadow-xl z-30 p-4'>
					<DayPicker
						mode='range'
						selected={range}
						onSelect={handleSelect}
						showOutsideDays // Add this for better UX
						// --- This is the new, simple, and correct styling ---
						classNames={{
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
