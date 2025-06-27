import React from 'react';
import { SparkleIcon } from '../components/Icons';
import PlanCard from '../components/PlanCard';

const PricingPage = () => {
	const plans = [
		{
			name: 'Free',
			price: '$0',
			priceSuffix: '/month',
			description:
				'A great way to get started and see the latest insights as they come in.',
			features: [
				{ text: 'Unlimited insight Browse', pro: false },
				{ text: 'Basic filtering by type and tag', pro: false },
				{ text: 'Daily data refresh', pro: false },
			],
			cta: 'Start for free',
			featured: false,
		},
		{
			name: 'Pro',
			price: '$10',
			priceSuffix: '/month',
			description:
				'Unlock the full power of market analysis with unlimited access and advanced tools.',
			features: [
				{ text: 'Access to Trend Clusters', pro: true },
				{ text: 'Advanced date-range filtering', pro: true },
				{ text: 'Priority support', pro: true },
			],
			cta: 'Start Pro Trial',
			featured: true,
		},
	];

	return (
		<div className='py-12'>
			<div className='mx-auto max-w-4xl text-center'>
				<h2 className='text-base font-semibold leading-7 text-amber-600 flex items-center justify-center gap-2'>
					<SparkleIcon className='h-5 w-5' />
					Pricing
				</h2>
				<p className='mt-2 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl'>
					A plan for every founder
				</p>
			</div>
			<p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-stone-600'>
				Whether you're exploring ideas or ready to dive deep, we have a
				plan that fits your needs.
			</p>
			<div className='isolate flex justify-center items-stretch flex-wrap gap-8 mt-16'>
				<PlanCard
					plan={plans[0]}
					isClickable={true}
					size='large'
				/>
				<PlanCard
					plan={plans[1]}
					isClickable={true}
					size='large'
					isSelected={true}
				/>
			</div>
		</div>
	);
};

export default PricingPage;