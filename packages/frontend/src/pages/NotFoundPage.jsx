import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
	return (
		<div className='text-center py-20'>
			<h1 className='text-6xl font-bold text-stone-800'>404</h1>
			<p className='text-xl mt-4 text-stone-500'>Page Not Found</p>
			<Link
				to='/'
				className='mt-6 inline-block bg-amber-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-amber-700'
			>
				Go Home
			</Link>
		</div>
	);
};

export default NotFoundPage;
