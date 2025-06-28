import React from 'react';
import { formatDate } from '../utils/formatDate.js';
import { FlameIcon, SproutIcon } from './Icons.jsx';

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

const InsightsTable = ({ insights }) => {
	if (!insights || insights.length === 0) {
		return (
			<div className='text-center py-16 px-6 bg-white rounded-lg border border-dashed border-stone-300'>
				<h3 className='text-sm font-semibold text-stone-800'>
					No insights found
				</h3>
				<p className='mt-1 text-sm text-stone-500'>
					Try adjusting your filters.
				</p>
			</div>
		);
	}

	return (
		<div className='bg-white border border-stone-200/80 rounded-2xl shadow-sm overflow-hidden'>
			<table className='min-w-full divide-y divide-stone-200'>
				<thead className='bg-stone-50'>
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
							Type
						</th>
						<th
							scope='col'
							className='hidden px-3 py-3.5 text-left text-sm font-semibold text-stone-900 sm:table-cell'
						>
							Tags
						</th>
						<th
							scope='col'
							className='relative py-3.5 pl-3 pr-4 sm:pr-6'
						>
							<span className='sr-only'>View Source</span>
						</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-stone-200 bg-white'>
					{insights.map((insight) => {
						const style = typeStyles[insight.type] || {};
						const sourceUrl = `https://news.ycombinator.com/item?id=${insight.sourceCommentId}`;

						return (
							<tr
								key={insight.id}
								className='hover:bg-stone-50'
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
					})}
				</tbody>
			</table>
		</div>
	);
};

export default InsightsTable;
