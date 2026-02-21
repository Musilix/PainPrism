import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiGetBundleById } from '../hooks/useInsights.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FlameIcon, SproutIcon, ChevronLeftIcon } from '../components/Icons.jsx';

const formatDate = (isoDate) => {
	if (!isoDate) return 'N/A';
	const date = new Date(isoDate);
	const corrected = new Date(
		date.getTime() + date.getTimezoneOffset() * 60000
	);
	return corrected.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const typeStyles = {
	'pain-point': {
		label: 'Pain Point',
		Icon: FlameIcon,
		bgColor: 'bg-purple-100',
		textColor: 'text-purple-800',
	},
	'product-yearning': {
		label: 'Product Yearning',
		Icon: SproutIcon,
		bgColor: 'bg-emerald-100',
		textColor: 'text-emerald-800',
	},
};

const InsightDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { token } = useAuth() || {};
	const [bundle, setBundle] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!id) return;
			setIsLoading(true);
			setError(null);
			try {
				const data = await apiGetBundleById(id, token);
				if (!cancelled) setBundle(data);
			} catch (err) {
				if (!cancelled) setError(err);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		})();
		return () => { cancelled = true; };
	}, [id, token]);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-12">
				<p className="text-stone-600">Loading...</p>
			</div>
		);
	}

	if (error || !bundle) {
		return (
			<div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-12">
				<p className="text-red-500">
					{error?.message || 'Insight not found.'}
				</p>
				<Link
					to="/"
					className="mt-4 text-amber-600 hover:text-amber-800 font-medium"
				>
					← Back to home
				</Link>
			</div>
		);
	}

	const style = typeStyles[bundle.type] || {};
	const { Icon } = style;
	const title = bundle.subject_name || 'Insight';
	const synopsis = bundle.textSummary || '';

	return (
		<div className="flex flex-col items-center w-full">
			<div className="w-full max-w-3xl mx-auto px-4 py-8">
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-amber-600 font-medium mb-8 transition-colors"
				>
					<ChevronLeftIcon className="h-4 w-4" />
					Back
				</button>

				<article className="bg-white border border-stone-200/80 rounded-2xl shadow-lg overflow-hidden">
					<div className="p-6 sm:p-8 border-b border-stone-100">
						<h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-3">
							{title}
						</h1>
						<div
							className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-full ${style.bgColor} ${style.textColor}`}
						>
							{Icon && <Icon />}
							{style.label}
						</div>
					</div>

					<div className="p-6 sm:p-8">
						<h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
							Summary
						</h2>
						<p className="text-stone-800 text-lg leading-relaxed font-serif whitespace-pre-wrap">
							{synopsis}
						</p>
					</div>

					<div className="p-6 sm:p-8 bg-stone-50/80 border-t border-stone-100">
						<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
							{bundle.audience_type && (
								<div>
									<dt className="text-stone-500 font-medium">Audience</dt>
									<dd className="text-stone-800 mt-0.5">
										{bundle.audience_type.replace(/_/g, ' ')}
									</dd>
								</div>
							)}
							{bundle.market_potential && (
								<div>
									<dt className="text-stone-500 font-medium">Market potential</dt>
									<dd className="text-stone-800 mt-0.5 capitalize">
										{bundle.market_potential}
									</dd>
								</div>
							)}
							<div>
								<dt className="text-stone-500 font-medium">Date</dt>
								<dd className="text-stone-800 mt-0.5">
									{formatDate(bundle.createdAt)}
								</dd>
							</div>
							{bundle.sourceUrl && (
								<div>
									<dt className="text-stone-500 font-medium">Source</dt>
									<dd className="mt-0.5">
										<a
											href={bundle.sourceUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-amber-600 hover:text-amber-800 font-medium"
										>
											View thread →
										</a>
									</dd>
								</div>
							)}
						</dl>
						{bundle.tags && bundle.tags.length > 0 && (
							<div className="mt-4 pt-4 border-t border-stone-200">
								<dt className="text-stone-500 font-medium text-sm mb-2">Tags</dt>
								<div className="flex flex-wrap gap-2">
									{bundle.tags.map((tag) => (
										<span
											key={tag}
											className="inline-block bg-stone-100 text-stone-600 text-xs font-medium px-2.5 py-1 rounded-full"
										>
											{tag}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				</article>
			</div>
		</div>
	);
};

export default InsightDetailPage;
