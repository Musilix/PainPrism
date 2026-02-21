import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
	return (
		<div className='py-16 px-4'>
			<div className='mx-auto max-w-lg text-center'>
				<h1 className='text-2xl font-bold text-stone-900'>
					Pro checkout
				</h1>
				<p className='mt-4 text-stone-600'>
					Stripe integration coming soon. You’ll be able to complete your upgrade here.
				</p>
				<Link
					to='/pricing'
					className='mt-8 inline-block bg-amber-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-amber-700'
				>
					Back to pricing
				</Link>
			</div>
		</div>
	);
};

export default CheckoutPage;
