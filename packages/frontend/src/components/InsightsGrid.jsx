import React from 'react';
import InsightCard from './InsightCard.jsx';
import NoResults from './NoResults.jsx';

const InsightsGrid = ({ insights, cardSize = 'large' }) => {
	if (!insights || insights.length === 0) {
		return <NoResults />;
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{insights.map((insight) => (
				<InsightCard
					key={insight.id}
					insight={insight}
					size={cardSize} // Pass the size prop down
				/>
			))}
		</div>
	);
};

export default InsightsGrid;
