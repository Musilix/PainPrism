import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, SparkleIcon } from './Icons';

// This is a single, reusable Plan Card component
const PlanCard = ({ plan, isSelected, onSelect, isClickable = false }) => {
	const navigate = useNavigate();

	const content = (
		<>
			{/* The "Glow" Effect */}
			{plan.featured && (
				<div
					className={`absolute -inset-2 bg-gradient-to-br from-violet-600 to-amber-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg -z-10`}
				/>
			)}
			<div className='flex justify-between items-start'>
				<h3
					className={`text-lg font-semibold leading-8 ${
						plan.featured ? 'text-violet-700' : 'text-stone-900'
					}`}
				>
					{plan.name}
				</h3>
				{isSelected && (
					<CheckCircleIcon
						className={`h-6 w-6 ${
							plan.featured ? 'text-violet-600' : 'text-amber-600'
						}`}
					/>
				)}
			</div>
			<p className='mt-4 text-sm leading-6 text-stone-600 flex-grow'>
				{plan.description}
			</p>
			<p className='mt-8 flex items-baseline gap-x-1'>
				<span className='text-4xl font-bold tracking-tight text-stone-900'>
					{plan.price}
				</span>
				<span className='text-sm font-semibold leading-6 text-stone-600'>
					{plan.priceSuffix}
				</span>
			</p>
			<ul
				role='list'
				className='mt-8 space-y-3 text-sm leading-6 text-stone-600'
			>
				{plan.features.map((feature) => (
					<li
						key={feature}
						className='flex gap-x-3'
					>
						<SparkleIcon className='h-6 w-5 flex-none text-amber-500' />
						{feature}
					</li>
				))}
			</ul>
			<div
				className={`mt-10 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 transition-colors ${
					plan.featured
						? 'bg-violet-600 text-white shadow-sm hover:bg-violet-500'
						: 'bg-amber-600 text-white shadow-sm hover:bg-amber-500'
				}`}
			>
				{plan.cta}
			</div>
		</>
	);

	const handleCardClick = () => {
		if (onSelect) {
			onSelect(plan.name.toLowerCase());
		}
		if (isClickable) {
			navigate(`/register?plan=${plan.name.toLowerCase()}`);
		}
	};

	return (
		<div
			onClick={handleCardClick}
			className={`group relative flex flex-col p-8 rounded-2xl border-2 w-full max-w-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${
				isSelected ? (plan.featured ? 'border-violet-500' : 'border-amber-500') : 'border-stone-200 bg-white'
			} ${isClickable ? 'cursor-pointer' : ''}`}
		>
			{content}
		</div>
	);
};

export default PlanCard;