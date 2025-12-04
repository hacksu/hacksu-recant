import { db } from '$lib/server/db';
import { leadership } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allLeaders = await db.query.leadership.findMany({
		orderBy: (leadership, { desc, asc }) => [
			desc(leadership.isCurrent),
			desc(leadership.gradYear),
			asc(leadership.gradTerm)
		]
	});

	// Separate current and past leaders
	const currentLeaders = allLeaders.filter((leader) => leader.isCurrent);
	const pastLeaders = allLeaders.filter((leader) => !leader.isCurrent);

	// Group past leaders by graduation term
	const leadersByTerm: Record<string, typeof pastLeaders> = {};
	for (const leader of pastLeaders) {
		const termKey = `${leader.gradTerm} ${leader.gradYear}`;
		if (!leadersByTerm[termKey]) {
			leadersByTerm[termKey] = [];
		}
		leadersByTerm[termKey].push(leader);
	}

	// Sort terms by year (newest first), then by term (Spring before Fall)
	const sortedTerms = Object.keys(leadersByTerm).sort((a, b) => {
		const [termA, yearA] = a.split(' ');
		const [termB, yearB] = b.split(' ');
		const yearNumA = parseInt(yearA, 10);
		const yearNumB = parseInt(yearB, 10);

		if (yearNumA !== yearNumB) {
			return yearNumB - yearNumA; // Newest year first
		}

		// If same year, Spring comes before Fall
		if (termA === 'Spring' && termB === 'Fall') return -1;
		if (termA === 'Fall' && termB === 'Spring') return 1;
		return 0;
	});

	return {
		currentLeaders,
		leadersByTerm,
		sortedTerms
	};
};