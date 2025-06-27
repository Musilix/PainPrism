import React from 'react';
import { Link } from 'react-router-dom';
import { PrismIcon } from '../components/Icons';

const LoginPage = () => {
	// We will add form logic here later
	return (
		<div className='w-full max-w-md mx-auto p-8'>
			<div className='text-center mb-8'>
				<Link
					to='/'
					className='inline-block'
				>
					<PrismIcon />
				</Link>
				<h2 className='mt-6 text-3xl font-bold text-center text-stone-900'>
					Sign in to your account
				</h2>
			</div>

			<div className='p-8 border border-stone-200 rounded-xl shadow-xl bg-white'>
				<form className='space-y-6'>
					<div>
						<label
							htmlFor='email'
							className='block text-sm font-medium text-gray-700'
						>
							Email address
						</label>
						<input
							id='email'
							name='email'
							type='email'
							autoComplete='email'
							required
							className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500'
						/>
					</div>
					<div>
						<label
							htmlFor='password'
							className='block text-sm font-medium text-gray-700'
						>
							Password
						</label>
						<input
							id='password'
							name='password'
							type='password'
							autoComplete='current-password'
							required
							className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500'
						/>
					</div>
					<div>
						<button
							type='submit'
							className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
						>
							Sign in
						</button>
					</div>
				</form>
			</div>

			<p className='mt-6 text-center text-sm'>
				Don't have an account?{' '}
				<Link
					to='/register'
					className='font-medium text-amber-600 hover:text-amber-500'
				>
					Register
				</Link>
			</p>
		</div>
	);
};

export default LoginPage;