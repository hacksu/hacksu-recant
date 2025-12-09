import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { logger } from '$lib/server/logger';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const repoName = params.name;

	logger.info('Loading lesson detail page', { repoName });

	if (!repoName) {
		logger.warn('Lesson detail page missing repo name');
		throw error(400, 'Repository name is required');
	}

	// Security: validate repo name
	if (!/^[a-zA-Z0-9._-]+$/.test(repoName)) {
		logger.warn('Invalid repository name format in lesson detail', { repoName });
		throw error(400, 'Invalid repository name');
	}

	try {
		const response = await fetch(`/api/lessons/repos/${repoName}/readme`);
		if (!response.ok) {
			logger.error('Failed to fetch README from API', undefined, {
				repoName,
				status: response.status,
				statusText: response.statusText
			});
			if (response.status === 404) {
				throw error(404, 'README not found for this lesson');
			}
			throw error(response.status, 'Failed to fetch README');
		}
		const data = await response.json();
		logger.info('Successfully loaded lesson detail page', {
			repoName,
			readmeLength: data.content?.length || 0
		});
		return { readme: data.content, repoName, error: null };
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		logger.error('Error loading lesson detail page', err, { repoName });
		return {
			readme: null,
			repoName,
			error: err instanceof Error ? err.message : 'Failed to load README'
		};
	}
};

