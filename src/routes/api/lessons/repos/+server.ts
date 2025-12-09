import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logger } from '$lib/server/logger';
import { getCachedRepos } from '$lib/server/redis';

export interface LessonRepo {
	id: string;
	name: string;
	description: string | null;
	html_url: string;
	updated_at: string;
	last_commit_date?: string;
	language: string | null;
	topics: string[];
}

export const GET: RequestHandler = async () => {
	try {
		// Try to get repos from Redis cache (populated by Python service)
		const repos = await getCachedRepos();

		if (repos && Array.isArray(repos) && repos.length > 0) {
			logger.info('Returning lesson repos from Redis cache', {
				repoCount: repos.length
			});
			return json(repos);
		}

		// Cache miss or empty - this should rarely happen if Python service is running
		logger.warn('No repos found in Redis cache. Python service may not be running or cache is empty.');
		throw error(503, {
			message:
				'Lesson repositories are temporarily unavailable. The cache service may be starting up. Please try again in a few moments.'
		});
	} catch (err) {
		// If it's already a SvelteKit error, re-throw it
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		logger.error('Error fetching lesson repos from Redis', err);
		const message = err instanceof Error ? err.message : 'Unknown error occurred';
		throw error(500, { message });
	}
};

