import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
	return (
		<div className='min-h-screen bg-stone-50 font-sans text-stone-800 relative'>
			<Header />
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{children}
			</main>
			<Footer />
		</div>
	);
};

export default Layout;
