// PainPrism-main/packages/frontend/src/pages/PricingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { SparkleIcon } from '../components/Icons';
import PlanCard from '../components/PlanCard';
import { useAuth } from '../context/AuthContext';

const PricingPage = () => {
	const { isLoggedIn, isProUser } = useAuth();

	const plans = [
		{
			name: 'Free',
			price: '$0',
			priceSuffix: '/month',
			description:
				'A great way to get started and see the latest insights as they come in.',
			features: [
				{ text: 'View latest insights', pro: false },
				{ text: 'Basic filtering by type and tag', pro: false },
				{ text: 'Daily data refresh', pro: false },
			],
			cta: 'Get Started',
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
				{
					text: 'Market potential and audience filtering',
					pro: true,
				},
				{ text: 'Export data (soon)', pro: true },
				{ text: 'Priority support', pro: true },
			],
			cta: 'Upgrade to Pro',
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

			{isProUser ? (
				<div className='mt-10 text-center bg-violet-50 border border-violet-200 rounded-lg p-8 max-w-md mx-auto'>
					<h3 className='text-lg font-semibold text-violet-800'>
						You are already a Pro member!
					</h3>
					<p className='mt-2 text-sm text-stone-600'>
						Thank you for your support. You have access to all
						features.
					</p>
					<Link
						to='/'
						className='mt-4 inline-block bg-violet-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-violet-700 cursor-pointer'
					>
						Back to Insights
					</Link>
				</div>
			) : (
				<>
					<p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-stone-600'>
						Whether you're exploring ideas or ready to dive deep, we
						have a plan that fits your needs.
					</p>
					<div className='isolate flex justify-center items-stretch flex-wrap gap-8 mt-16'>
						<PlanCard
							plan={plans[0]}
							isClickable={!isLoggedIn}
							isSelected={isLoggedIn && !isProUser}
							size='large'
						/>
						<PlanCard
							plan={plans[1]}
							isClickable={true}
							// For a free user, Pro is the selected upgrade path
							isSelected={
								!isLoggedIn || (isLoggedIn && !isProUser)
							}
							size='large'
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default PricingPage;
