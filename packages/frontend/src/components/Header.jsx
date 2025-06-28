// PainPrism-main/packages/frontend/src/components/Header.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PrismIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

const Header = () => {
	const { isLoggedIn, user, logout } = useAuth();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Handle clicks outside the dropdown to close it
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setIsDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const username = user ? user.email.split('@')[0] : '';

	return (
		<header className='w-full sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-stone-200'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='relative flex items-center justify-between h-16'>
					{/* Left Side: Logo/Home */}
					<div className='flex-1 flex items-center justify-start'>
						<Link
							to='/'
							className='flex items-center gap-3 group'
						>
							<PrismIcon />
							<span className='hidden sm:inline font-bold text-xl text-stone-800 group-hover:text-amber-600 transition-colors'>
								Pain Prism
							</span>
						</Link>
					</div>

					{/* Right Side: User Actions */}
					<div className='flex items-center justify-end gap-4'>
						<Link
							to='/pricing'
							className='text-sm font-semibold text-stone-600 hover:text-amber-600 transition-colors cursor-pointer'
						>
							Pricing
						</Link>
						<div className='h-6 w-px bg-stone-200'></div>

						{isLoggedIn ? (
							<div
								className='relative'
								ref={dropdownRef}
							>
								<button
									onClick={() =>
										setIsDropdownOpen((prev) => !prev)
									}
									className='flex items-center text-sm font-semibold bg-stone-100 px-3 py-1.5 rounded-full hover:bg-stone-200 transition-colors cursor-pointer'
								>
									{username}
									<svg
										className={`ml-1 h-5 w-5 text-stone-500 transition-transform duration-200 ${
											isDropdownOpen ? 'rotate-180' : ''
										}`}
										xmlns='http://www.w3.org/2000/svg'
										viewBox='0 0 20 20'
										fill='currentColor'
									>
										<path
											fillRule='evenodd'
											d='M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z'
											clipRule='evenodd'
										/>
									</svg>
								</button>
								<div
									className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-stone-200/75 z-50 overflow-hidden transition-all duration-150 ease-out ${
										isDropdownOpen
											? 'transform opacity-100 scale-100'
											: 'transform opacity-0 scale-95 pointer-events-none'
									}`}
								>
									<div className='px-4 py-3'>
										<p className='text-sm text-stone-500'>
											Signed in as
										</p>
										<p className='text-sm font-medium text-stone-800 truncate'>
											{user.email}
										</p>
									</div>
									<div className='border-t border-stone-100'></div>
									<div className='py-1'>
										<Link
											to='/profile'
											onClick={() =>
												setIsDropdownOpen(false)
											}
											className='flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 cursor-pointer'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-5 w-5 text-stone-400'
												viewBox='0 0 20 20'
												fill='currentColor'
											>
												<path
													fillRule='evenodd'
													d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
													clipRule='evenodd'
												/>
											</svg>
											Your Profile
										</Link>
									</div>
									<div className='border-t border-stone-100'></div>
									<div className='py-1'>
										<button
											onClick={() => {
												logout();
												setIsDropdownOpen(false);
											}}
											className='flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 cursor-pointer'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-5 w-5 text-stone-400'
												viewBox='0 0 20 20'
												fill='currentColor'
											>
												<path
													fillRule='evenodd'
													d='M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z'
													clipRule='evenodd'
												/>
											</svg>
											Logout
										</button>
									</div>
								</div>
							</div>
						) : (
							<Link
								to='/login'
								className='text-sm font-semibold bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition-colors cursor-pointer'
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