import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
	// We will add form logic here later
	return (
		<div className='max-w-md mx-auto mt-10 p-8 border rounded-lg shadow-sm bg-white'>
			<h2 className='text-2xl font-bold text-center'>
				Create an Account
			</h2>
			<form className='mt-8 space-y-6'>
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
						autoComplete='new-password'
						required
						className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500'
					/>
				</div>
				<div>
					<button
						type='submit'
						className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
					>
						Create Account
					</button>
				</div>
				<p className='text-center text-sm'>
					Already have an account?{' '}
					<Link
						to='/login'
						className='font-medium text-amber-600 hover:text-amber-500'
					>
						Login
					</Link>
				</p>
			</form>
		</div>
	);
};

export default RegisterPage;
