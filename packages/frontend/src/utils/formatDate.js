export const formatDate = (isoDate) => {
	if (!isoDate) return 'N/A';
	const date = new Date(isoDate);
	const correctedDate = new Date(
		date.getTime() + date.getTimezoneOffset() * 60000
	);
	return correctedDate.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};
