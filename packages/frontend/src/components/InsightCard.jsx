import React from 'react';

// --- INLINED DEPENDENCIES TO FIX BUILD ERROR ---

const formatDate = (isoDate) => {
	if (!isoDate) return 'N/A';
	const date = new Date(isoDate);
	// This timezone correction is important for consistent display
	const correctedDate = new Date(
		date.getTime() + date.getTimezoneOffset() * 60000
	);
	return correctedDate.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const FlameIcon = () => (
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

const SproutIcon = () => (
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

// --- END INLINE DEPENDENCIES ---

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

const Tag = ({ children }) => (
	<span className='inline-block bg-stone-100 text-stone-600 text-xs font-medium mr-1.5 mb-1.5 px-2.5 py-1 rounded-full'>
		{children}
	</span>
);

const InsightCard = ({ insight, size = 'large' }) => {
	const style = typeStyles[insight.type] || {};
	const { Icon } = style;

	let sourceUrl = '#';
	if (insight.sourceCommentId) {
		sourceUrl = `https://news.ycombinator.com/item?id=${insight.sourceCommentId}`; //TODO - remove in the future
	}

	const handleClick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (sourceUrl && sourceUrl !== '#') {
			window.open(sourceUrl, '_blank', 'noopener,noreferrer');
		}
	};

	if (size === 'medium') {
		return (
			<div
				onClick={handleClick}
				className='bg-white border border-stone-200/80 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer group'
			>
				{/* Header Section */}
				<div className='p-4 border-b border-stone-200'>
					<div className='flex justify-between items-center'>
						<div
							className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${style.bgColor} ${style.textColor}`}
						>
							{Icon && <Icon />}
							{style.label}
						</div>
						<span className='text-xs text-stone-400 font-medium'>
							{formatDate(insight.date)}
						</span>
					</div>
				</div>
				{/* Body Section - Smaller text and adjusted line clamp */}
				<p className='p-4 text-stone-700 text-sm leading-relaxed flex-grow line-clamp-5'>
					{insight.text}
				</p>
				{/* Footer Section */}
				<div className='p-4 bg-stone-100 rounded-b-2xl border-t border-stone-100 text-xs text-stone-500 group-hover:text-amber-600 transition-colors font-medium truncate'>
					Source: {insight.subject_name || 'Hacker News Thread'}
					<span className='ml-1 opacity-0 group-hover:opacity-100 transition-opacity'>
						→
					</span>
				</div>
			</div>
		);
	}

	// Large card for any other potential use
	return (
		<div
			onClick={handleClick}
			className='bg-white border border-stone-200/80 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer group'
		>
			<div className='p-6 border-b border-stone-100'>
				<div className='flex justify-between items-center'>
					<div
						className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${style.bgColor} ${style.textColor}`}
					>
						{Icon && <Icon />}
						{style.label}
					</div>
					<span className='text-xs text-stone-500 font-medium'>
						{formatDate(insight.date)}
					</span>
				</div>
			</div>
			<div className='p-6 flex-grow'>
				<p className='text-stone-800 text-lg leading-relaxed font-serif'>
					{insight.text}
				</p>
			</div>
			<div className='p-6 bg-stone-50/70 rounded-b-2xl border-t border-stone-100'>
				{insight.tags && (
					<div className='mb-2'>
						{insight.tags.map((tag) => (
							<Tag key={tag}>{tag}</Tag>
						))}
					</div>
				)}
				<div className='text-xs text-stone-500 group-hover:text-amber-700 transition-colors font-medium'>
					Source: {insight.subject_name || 'Hacker News Thread'}
					<span className='ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 inline-block'>
						→
					</span>
				</div>
			</div>
		</div>
	);
};

export default InsightCard;
