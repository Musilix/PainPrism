import React from 'react';
import InsightCard from './InsightCard';
import NoResults from './NoResults';

const InsightsGrid = ({ insights }) => {
	if (insights.length === 0) {
		return <NoResults />;
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
			{insights.map((insight) => (
				<InsightCard
					key={insight.id}
					insight={insight}
				/>
			))}
		</div>
	);
};

export default InsightsGrid;
