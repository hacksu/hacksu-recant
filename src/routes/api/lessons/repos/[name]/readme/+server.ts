import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logger } from '$lib/server/logger';
import { getCachedReadme } from '$lib/server/redis';
import { env } from '$env/dynamic/private';

interface ReadmeResponse {
	content: string;
	encoding: string;
}

async function fetchReadmeFromGitHub(repoName: string, org: string): Promise<string | null> {
	const githubToken = env.GITHUB_TOKEN;
	if (!githubToken) {
		logger.error('GITHUB_TOKEN environment variable is not set');
		return null;
	}

	const headers: HeadersInit = {
		Accept: 'application/vnd.github.v3+json',
		Authorization: `token ${githubToken}`,
		'User-Agent': 'HacKSU-Website'
	};

	try {
		logger.debug('Fetching README from GitHub API', { repoName, org });
		const response = await fetch(`https://api.github.com/repos/${org}/${repoName}/readme`, {
			headers
		});

		if (!response.ok) {
			if (response.status === 404) {
				logger.debug('README not found for repository', { repoName });
				return null;
			}
			logger.error('GitHub API request failed for README', undefined, {
				repoName,
				status: response.status,
				statusText: response.statusText
			});
			return null;
		}

		const data: ReadmeResponse = await response.json();

		// Decode base64 content
		if (data.encoding === 'base64') {
			const content = Buffer.from(data.content, 'base64').toString('utf-8');
			logger.info('Successfully fetched and decoded README from GitHub', {
				repoName,
				contentLength: content.length
			});
			return content;
		}

		logger.warn('README encoding is not base64', { repoName, encoding: data.encoding });
		return data.content;
	} catch (err) {
		logger.error('Error fetching README from GitHub', err, { repoName });
		return null;
	}
}

export const GET: RequestHandler = async ({ params }) => {
	const repoName = params.name;
	const org = 'hacksu';

	logger.info('Fetching README for lesson repo', { repoName, org });

	if (!repoName) {
		logger.warn('README request missing repo name');
		throw error(400, 'Repository name is required');
	}

	// Security: validate repo name to prevent path traversal
	if (!/^[a-zA-Z0-9._-]+$/.test(repoName)) {
		logger.warn('Invalid repository name format', { repoName });
		throw error(400, 'Invalid repository name');
	}

	try {
		// Try Redis cache first
		let content = await getCachedReadme(repoName);

		if (content) {
			logger.info('Returning README from Redis cache', {
				repoName,
				contentLength: content.length
			});
			return json({ content });
		}

		// Cache miss - fallback to GitHub API
		logger.debug('README not in cache, fetching from GitHub', { repoName });
		content = await fetchReadmeFromGitHub(repoName, org);

		if (content) {
			return json({ content });
		}

		// Not found in either cache or GitHub
		throw error(404, 'README not found for this repository');
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		logger.error('Error fetching README', err, { repoName });
		throw error(500, 'Failed to fetch README');
	}
};

