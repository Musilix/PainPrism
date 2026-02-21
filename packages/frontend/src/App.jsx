import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import InsightsPage from './pages/InsightsPage';
import InsightDetailPage from './pages/InsightDetailPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
	return (
		<Router>
			<Layout>
				<Routes>
					<Route
						path='/'
						element={<HomePage />}
					/>
					<Route
						path='/insights'
						element={<InsightsPage />}
					/>
					<Route
						path='/insights/:id'
						element={<InsightDetailPage />}
					/>
					<Route
						path='/login'
						element={<LoginPage />}
					/>
					<Route
						path='/register'
						element={<RegisterPage />}
					/>
					<Route
						path='/pricing'
						element={<PricingPage />}
					/>
					<Route
						path='/checkout'
						element={<CheckoutPage />}
					/>
					<Route
						path='/profile'
						element={<ProfilePage />}
					/>
					<Route
						path='*'
						element={<NotFoundPage />}
					/>
				</Routes>
			</Layout>
		</Router>
	);
}
