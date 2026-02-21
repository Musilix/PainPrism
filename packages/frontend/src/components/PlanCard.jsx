import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, SparkleIcon } from './Icons';

const PlanCard = ({
	plan,
	isSelected,
	onSelect,
	isClickable = false,
	isGrayedOut = false,
	ctaTo,
	size = 'large',
}) => {
	const navigate = useNavigate();

	const handleCardClick = () => {
		if (onSelect) {
			onSelect(plan.name.toLowerCase());
		}
		if (isClickable && !isGrayedOut) {
			const destination = ctaTo || `/register?plan=${plan.name.toLowerCase()}`;
			navigate(destination);
		}
	};

	// --- RENDER PATH FOR SMALL CARDS (ON REGISTER PAGE) ---
	if (size === 'small') {
		return (
			<div
				onClick={handleCardClick}
				className={`group relative rounded-xl p-4 cursor-pointer border-2 transition-all duration-300 -z-0 overflow-hidden ${
					isSelected
						? plan.featured
							? 'border-violet-400 shadow-md scale-105' // Softer border color
							: 'border-amber-500 shadow-lg scale-105'
						: 'border-stone-200 bg-white hover:border-stone-300'
				}`}
			>
				{/* Permanent gradient for the featured small card */}
				{plan.featured && (
					<div className='absolute inset-0 bg-gradient-to-br from-violet-100 to-amber-100 -z-10' />
				)}
				<h3
					className={`font-bold ${
						plan.featured ? 'text-violet-700' : 'text-stone-800'
					}`}
				>
					{plan.name}
				</h3>
				<p className='text-sm text-stone-500'>
					{plan.price}
					<span className='text-xs'>/mo</span>
				</p>
				{isSelected && (
					<div
						className={`absolute top-2 right-2 transition-colors ${
							plan.featured ? 'text-violet-600' : 'text-amber-600'
						}`}
					>
						<CheckCircleIcon className='h-5 w-5' />
					</div>
				)}
			</div>
		);
	}

	// --- RENDER PATH FOR LARGE CARDS (ON PRICING PAGE) ---
	return (
		<div
			onClick={handleCardClick}
			className={`group relative flex flex-col p-8 rounded-2xl border-2 w-full max-w-sm transition-all duration-300 overflow-hidden bg-white ${
				isGrayedOut
					? 'opacity-70 cursor-default border-stone-200'
					: isClickable
						? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1'
						: ''
			} ${!isGrayedOut && isSelected ? (plan.featured ? 'border-violet-400' : 'border-amber-500') : isGrayedOut ? '' : 'border-stone-200'}`}
		>
			{isGrayedOut && (
				<div className='absolute top-4 right-4 rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-600'>
					Current plan
				</div>
			)}
			{plan.featured && !isGrayedOut && (
				<>
					<div className='absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-amber-50 -z-10' />
					<div className='absolute -inset-4 bg-gradient-to-br from-violet-600 to-amber-500 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-2xl -z-10' />
				</>
			)}

			{/* Header */}
			<div className='text-center'>
				<h3 className='text-2xl font-bold text-stone-900'>{plan.name}</h3>
				<p className='mt-2 text-base text-stone-600'>{plan.description}</p>
			</div>

			{/* Price */}
			<div className='mt-8 text-center'>
				<p className='flex items-baseline justify-center gap-x-1'>
					<span className='text-5xl font-extrabold tracking-tight text-stone-900'>
						{plan.price}
					</span>
					<span className='text-sm font-semibold leading-6 text-stone-600'>
						{plan.priceSuffix}
					</span>
				</p>
			</div>

			{/* Features */}
			<ul
				role='list'
				className='mt-8 space-y-4 text-sm leading-6 text-stone-700 flex-grow'
			>
				{plan.features.map((feature) => (
					<li
						key={feature.text}
						className='flex gap-x-3 items-center'
					>
						{feature.pro ? (
							<SparkleIcon className='h-5 w-5 flex-none text-violet-500' />
						) : (
							<CheckCircleIcon className='h-5 w-5 flex-none text-stone-400' />
						)}
						<span>{feature.text}</span>
					</li>
				))}
			</ul>

			{/* CTA Button */}
			<div
				className={`mt-10 block rounded-md py-3 px-3 text-center text-base font-semibold leading-6 transition-colors ${
					plan.featured
						? 'bg-violet-600 text-white shadow-lg hover:bg-violet-500'
						: 'bg-amber-600 text-white shadow-sm hover:bg-amber-500'
				}`}
			>
				{plan.cta}
			</div>
		</div>
	);
};

export default PlanCard;