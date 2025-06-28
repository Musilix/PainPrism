import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PrismIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { apiLogin } from '../utils/api';

const LoginPage = () => {
	const navigate = useNavigate();
	const { login } = useAuth();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	// --- VALIDATION LOGIC ---
	const validateEmail = (email) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		// --- Frontend Validation ---
		if (!validateEmail(email)) {
			setError('Please enter a valid email address.');
			return;
		}
		if (!password) {
			setError('Password is required.');
			return;
		}
		// --- End Validation ---

		setIsLoading(true);

		try {
			const data = await apiLogin({ email, password });
			if (data.access_token) {
				login(data.access_token);
				navigate('/');
			} else {
				setError('Login failed. Please try again.');
			}
		} catch (err) {
			if (err.message.includes('Failed to fetch')) {
				setError(
					'Cannot connect to the server. Please ensure it is running.'
				);
			} else {
				setError(err.message || 'An unexpected error occurred.');
			}
		} finally {
			setIsLoading(false);
		}
	};

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
				<form
					className='space-y-6'
					onSubmit={handleSubmit}
				>
					{error && (
						<div
							className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md'
							role='alert'
						>
							<span className='block sm:inline'>{error}</span>
						</div>
					)}
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
							value={email}
							onChange={(e) => setEmail(e.target.value)}
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
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500'
						/>
					</div>
					<div>
						<button
							type='submit'
							disabled={isLoading}
							className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50'
						>
							{isLoading ? 'Signing in...' : 'Sign in'}
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