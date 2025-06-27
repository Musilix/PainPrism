import React from 'react';
import { Link } from 'react-router-dom';
import { PrismIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

const Header = () => {
	const { isLoggedIn, logout } = useAuth();

	return (
		<header className='w-full sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-stone-200'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='relative flex items-center justify-between h-16'>
					{/* Left Side: Logo/Home */}
					<div className='flex-1 flex items-center justify-start'>
						<Link
							to='/'
							className='flex items-center gap-2 group'
						>
							<PrismIcon />
							<span className='hidden sm:inline font-bold text-lg text-stone-800 group-hover:text-amber-600 transition-colors'>
								The Pain Prism
							</span>
						</Link>
					</div>

					{/* Right Side: User Actions */}
					<div className='flex-1 flex items-center justify-end gap-4'>
						{isLoggedIn ? (
							<button
								onClick={logout}
								className='text-sm font-semibold text-stone-600 hover:text-amber-600 transition-colors'
							>
								Logout
							</button>
						) : (
							<Link
								to='/login'
								className='text-sm font-semibold bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition-colors'
							>
								Log in
							</Link>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;