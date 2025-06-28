// PainPrism-main/packages/frontend/src/pages/NotFoundPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
	return (
		<div className='flex flex-col items-center justify-center text-center py-20'>
			<div className='relative w-48 h-48 flex items-center justify-center'>
				{/* Abstract background shapes */}
				<div className='absolute w-full h-full bg-amber-200 rounded-full opacity-30 blur-2xl'></div>
				<div className='absolute w-3/4 h-3/4 bg-violet-200 rounded-full opacity-30 blur-2xl animate-pulse'></div>
				{/* "404" Text */}
				<h1 className='relative text-8xl font-black text-stone-800 tracking-tighter'>
					404
				</h1>
			</div>

			<h2 className='mt-8 text-3xl font-bold text-stone-900'>
				Oops! Page not found.
			</h2>
			<p className='mt-2 text-lg text-stone-500 max-w-md'>
				The page you're looking for seems to have gotten lost in the
				noise. Let's get you back to clarity.
			</p>
			<Link
				to='/'
				className='mt-8 inline-block bg-amber-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl'
			>
				Go back home
			</Link>
		</div>
	);
};

export default NotFoundPage;