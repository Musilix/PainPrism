import React from 'react';
import { PrismIcon } from './Icons';

const Header = () => (
	<header className='text-center mb-12'>
		<div className='flex justify-center mb-4'>
			<PrismIcon />
		</div>
		<h1 className='text-4xl font-bold tracking-tight text-stone-800'>
			The Pain Prism
		</h1>
		<p className='mt-3 text-lg text-stone-500'>
			Refracting market noise into actionable insights.
		</p>
	</header>
);

export default Header;
