import React from 'react';
import { FlameIcon, SproutIcon } from './Icons';
import { formatDate } from '../utils/formatDate';

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
		bgColor: 'bg-green-100',
		textColor: 'text-green-800',
	},
};

const Tag = ({ children }) => (
	<span className='inline-block bg-stone-200 text-stone-700 text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded-full'>
		{children}
	</span>
);

const InsightCard = ({ insight }) => {
	const style = typeStyles[insight.type] || {};
	const { Icon } = style;
	const handleClick = () =>
		window.open(insight.sourceUrl, '_blank', 'noopener,noreferrer');

	return (
		<div
			onClick={handleClick}
			className='bg-white/70 backdrop-blur-sm border border-stone-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col h-full cursor-pointer group'
		>
			<div className='flex justify-between items-start mb-4'>
				<div
					className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${style.bgColor} ${style.textColor}`}
				>
					{Icon && <Icon />}
					{style.label}
				</div>
				<span className='text-xs text-stone-500 font-medium'>
					{formatDate(insight.date)}
				</span>
			</div>
			<p className='text-stone-700 text-base leading-relaxed flex-grow'>
				{insight.text}
			</p>
			<div className='mt-6'>
				<div className='mb-4'>
					{insight.tags.map((tag) => (
						<Tag key={tag}>{tag}</Tag>
					))}
				</div>
				<div className='text-sm text-stone-500 group-hover:text-amber-600 transition-colors'>
					Source: {insight.sourcePost}
					<span className='ml-1 opacity-0 group-hover:opacity-100 transition-opacity'>
						→
					</span>
				</div>
			</div>
		</div>
	);
};

export default InsightCard;
