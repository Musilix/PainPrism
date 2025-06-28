import React from 'react';
import { FlameIcon, SproutIcon } from './Icons.jsx';
import { formatDate } from '../utils/formatDate.js';

const typeStyles = {
	'pain-point': {
		label: 'Pain Point',
		Icon: FlameIcon,
		bgColor: 'bg-red-100',
		textColor: 'text-red-800',
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

	// This logic is still temporary, but it's more robust.
	// The backend should provide the full URL.
	let sourceUrl = '#';
	if (insight.sourceCommentId) {
		sourceUrl = `https://news.ycombinator.com/item?id=${insight.sourceCommentId}`;
	}

	const handleClick = (e) => {
		e.preventDefault(); // Prevent default if wrapped in a link
		e.stopPropagation(); // Stop event from bubbling up
		if (sourceUrl && sourceUrl !== '#') {
			window.open(sourceUrl, '_blank', 'noopener,noreferrer');
		}
	};

	// --- A new "medium" size for the homepage ---
	if (size === 'medium') {
		return (
			<div
				onClick={handleClick}
				className='bg-white border border-stone-200/80 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col h-full cursor-pointer group'
			>
				<div className='flex justify-between items-start mb-3'>
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
				<p className='text-stone-700 text-base leading-relaxed flex-grow line-clamp-4'>
					{insight.text}
				</p>
				<div className='mt-4 text-xs text-stone-500 group-hover:text-amber-600 transition-colors font-medium truncate'>
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
					"{insight.text}"
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
