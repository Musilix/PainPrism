import React from 'react';

export const FlameIcon = () => (
	<svg
		className='h-4 w-4 mr-1.5'
		xmlns='http://www.w3.org/2000/svg'
		fill='none'
		viewBox='0 0 24 24'
		strokeWidth={1.5}
		stroke='currentColor'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			d='M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z'
		/>
	</svg>
);
export const SproutIcon = () => (
	<svg
		className='h-4 w-4 mr-1.5'
		xmlns='http://www.w3.org/2000/svg'
		fill='none'
		viewBox='0 0 24 24'
		strokeWidth={1.5}
		stroke='currentColor'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			d='M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.5 21.75l-.398-1.188a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.188-.398a2.25 2.25 0 001.423-1.423L16.5 15.75l.398 1.188a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.188.398a2.25 2.25 0 00-1.423 1.423z'
		/>
	</svg>
);
export const PrismIcon = () => (
	<svg
		className='h-14 w-14 drop-shadow-sm'
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		aria-hidden='true'
	>
		<g
			stroke='rgba(0,0,0,0.1)'
			strokeWidth='0.5'
		>
			<path
				fill='rgb(217 119 6)'
				fillOpacity='0.8'
				d='M4 4h16l-3.5 6H7.5L4 4z'
			/>
			<path
				fill='rgb(217 119 6)'
				fillOpacity='0.55'
				d='M7.5 10h9l-1.5 3h-6l-1.5-3z'
			/>
			<path
				fill='rgb(217 119 6)'
				fillOpacity='0.3'
				d='M9 13h6l-1.5 3h-3L9 13z'
			/>
		</g>
		<path
			fill='rgb(239 68 68)'
			stroke='rgba(0,0,0,0.1)'
			strokeWidth='0.5'
			d='M12 21.75l-1.25-2.5L8.25 18l2.5-1.25L12 14.25l1.25 2.5 2.5 1.25-2.5 1.25L12 21.75z'
		/>
	</svg>
);
export const ChevronDownIcon = () => (
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

export const StarIcon = () => (
	<svg
		className='h-4 w-4'
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 20 20'
		fill='currentColor'
	>
		<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
	</svg>
);

export const CheckCircleIcon = (props) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 20 20'
		fill='currentColor'
		{...props}
	>
		<path
			fillRule='evenodd'
			d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
			clipRule='evenodd'
		/>
	</svg>
);

export const SparkleIcon = (props) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 20 20'
		fill='currentColor'
		{...props}
	>
		<path
			fillRule='evenodd'
			d='M10.868 2.884c.321-.772 1.308-.772 1.629 0l1.314 3.174a.69.69 0 00.523.523l3.174 1.314c.772.321.772 1.308 0 1.629l-3.174 1.314a.69.69 0 00-.523.523l-1.314 3.174c-.321.772-1.308.772-1.629 0l-1.314-3.174a.69.69 0 00-.523-.523l-3.174-1.314c-.772-.321-.772-1.308 0-1.629l3.174-1.314a.69.69 0 00.523-.523z'
			clipRule='evenodd'
		/>
	</svg>
);

export const CalendarIcon = (props) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 20 20'
		fill='currentColor'
		{...props}
	>
		<path
			fillRule='evenodd'
			d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
			clipRule='evenodd'
		/>
	</svg>
);
