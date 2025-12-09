import { createClient } from 'redis';
import { env } from '$env/dynamic/private';
import { logger } from './logger';

let redisClient: ReturnType<typeof createClient> | null = null;
let connectionPromise: Promise<void> | null = null;

async function ensureConnected(): Promise<ReturnType<typeof createClient>> {
	if (!redisClient) {
		const redisUrl = env.REDIS_URL || 'redis://localhost:6379';

		redisClient = createClient({
			url: redisUrl,
			socket: {
				reconnectStrategy: (retries) => {
					if (retries > 10) {
						logger.error('Redis reconnection failed after 10 attempts');
						return new Error('Redis reconnection failed');
					}
					return Math.min(retries * 100, 3000);
				}
			}
		});

		redisClient.on('error', (err) => {
			logger.error('Redis client error', err);
		});

		redisClient.on('connect', () => {
			logger.info('Redis client connected');
		});

		redisClient.on('reconnecting', () => {
			logger.info('Redis client reconnecting...');
		});

		connectionPromise = redisClient.connect().catch((err) => {
			logger.error('Failed to connect to Redis', err);
			connectionPromise = null;
			throw err;
		});
	}

	// Wait for connection if it's still in progress
	if (connectionPromise) {
		try {
			await connectionPromise;
		} catch (err) {
			// Connection failed, but we'll still try to use the client
			// (it might reconnect automatically)
		}
	}

	return redisClient;
}

export async function getCachedRepos(): Promise<any[] | null> {
	try {
		const client = await ensureConnected();
		const data = await client.get('lessons:repos');
		if (data) {
			return JSON.parse(data);
		}
		return null;
	} catch (err) {
		logger.error('Error retrieving repos from Redis', err);
		return null;
	}
}

export async function getCachedReadme(repoName: string): Promise<string | null> {
	try {
		const client = await ensureConnected();
		const key = `lessons:readme:${repoName}`;
		const content = await client.get(key);
		return content || null;
	} catch (err) {
		logger.error(`Error retrieving README for ${repoName} from Redis`, err);
		return null;
	}
}

