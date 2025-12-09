import type { PageServerLoad } from './$types';

// Return empty data to allow immediate skeleton rendering
// Data will be loaded client-side for better perceived performance
export const load: PageServerLoad = async () => {
	return {
		repos: [],
		error: null
	};
};

