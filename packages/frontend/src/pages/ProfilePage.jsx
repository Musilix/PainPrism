// PainPrism-main/packages/frontend/src/pages/ProfilePage.jsx

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { SparkleIcon } from '../components/Icons';

const ProfilePage = () => {
	const { user, isLoggedIn } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		// If the auth state is resolved and the user is not logged in, redirect.
		if (!isLoggedIn) {
			navigate('/login');
		}
	}, [isLoggedIn, navigate]);

	// While waiting for auth state or during redirect, render nothing.
	if (!user) {
		return null;
	}

	const handleDeleteAccount = () => {
		alert('Deletion logic not yet implemented.');
	};

	return (
		<div className='max-w-3xl mx-auto py-8 px-4'>
			{/* Header */}
			<div className='mb-10'>
				<div className='flex items-center gap-4'>
					<div className='w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-violet-500 flex items-center justify-center ring-4 ring-white shadow-sm'>
						<span className='text-4xl font-bold text-white'>
							{user.email.charAt(0).toUpperCase()}
						</span>
					</div>
					<div>
						<h1 className='text-3xl font-extrabold tracking-tight text-stone-900'>
							{user.email.split('@')[0]}
						</h1>
						<p className='text-stone-500'>{user.email}</p>
					</div>
				</div>
			</div>

			{/* Main Content Block */}
			<div className='bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm'>
				{/* Subscription Section */}
				<div className='mb-6'>
					<h2 className='text-lg font-bold text-stone-800'>
						Subscription
					</h2>
					<p className='text-sm text-stone-500'>
						Your current plan and upgrade options.
					</p>
					<div className='mt-4 bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row justify-between sm:items-center'>
						<div className='flex items-center gap-3'>
							<span
								className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
									user.status === 'pro'
										? 'bg-violet-100 text-violet-800'
										: 'bg-stone-200 text-stone-800'
								}`}
							>
								{user.status === 'pro'
									? 'Pro Plan'
									: 'Free Plan'}
							</span>
							<p className='text-sm text-stone-600'>
								{user.status === 'pro'
									? 'All features unlocked.'
									: 'Basic access.'}
							</p>
						</div>
						{user.status === 'free' && (
							<Link
								to='/checkout'
								className='mt-3 sm:mt-0 flex items-center justify-center gap-2 text-sm font-semibold bg-violet-600 text-white px-4 py-2 rounded-full hover:bg-violet-700 transition-colors cursor-pointer'
							>
								<SparkleIcon className='h-4 w-4' />
								Upgrade Plan
							</Link>
						)}
					</div>
				</div>

				<hr className='my-6 border-stone-200' />

				{/* Danger Zone */}
				<div className='bg-red-50/50 p-4 rounded-xl border border-red-200/60'>
					<h2 className='text-lg font-bold text-red-700'>
						Danger Zone
					</h2>
					<div className='mt-2 flex flex-col sm:flex-row justify-between sm:items-center'>
						<p className='text-sm text-red-800/80 max-w-md'>
							Permanently delete your account. This action is
							irreversible and will erase all your data.
						</p>
						<button
							onClick={handleDeleteAccount}
							className='mt-3 sm:mt-0 px-4 py-2 border rounded-md text-sm font-medium text-red-600 bg-white hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer'
						>
							Delete Account
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;