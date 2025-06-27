import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PrismIcon } from '../components/Icons';
import PlanCard from '../components/PlanCard';

const RegisterPage = () => {
    const [searchParams] = useSearchParams();
    const initialPlan = searchParams.get('plan') || 'pro';
    const [selectedPlan, setSelectedPlan] = useState(initialPlan);

    const plans = [
        { name: 'Free', price: '$0', featured: false },
        { name: 'Pro', price: '$10', featured: true },
    ];

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
					Create your account
				</h2>
			</div>
			
			<div className='p-8 border border-stone-200 rounded-xl shadow-xl bg-white'>
				<form className='space-y-6'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Choose your plan
                        </label>
                        <div className='grid grid-cols-2 gap-4'>
                            {plans.map((plan) => (
                                <PlanCard
                                    key={plan.name}
                                    plan={plan}
                                    isSelected={
                                        selectedPlan === plan.name.toLowerCase()
                                    }
                                    onSelect={setSelectedPlan}
                                    size='small'
                                />
                            ))}
                        </div>
                    </div>
					
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
							Sign up for{' '}
							{selectedPlan.charAt(0).toUpperCase() +
								selectedPlan.slice(1)}
						</button>
					</div>
				</form>
			</div>

            <p className='mt-6 text-center text-sm'>
				Already have an account?{' '}
				<Link
					to='/login'
					className='font-medium text-amber-600 hover:text-amber-500'
				>
					Login
				</Link>
			</p>
		</div>
	);
};

export default RegisterPage;