import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';

async function listFilesRecursive(rootDir: string): Promise<
	Array<{ path: string; size: number; mtime: string }>
> {
	const results: Array<{ path: string; size: number; mtime: string }> = [];

	async function walk(currentDir: string) {
		const entries = await readdir(currentDir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = join(currentDir, entry.name);
			if (entry.isDirectory()) {
				await walk(fullPath);
			} else if (entry.isFile()) {
				const stats = await stat(fullPath);
				results.push({
					path: relative(rootDir, fullPath).replace(/\\/g, '/'),
					size: stats.size,
					mtime: stats.mtime.toISOString()
				});
			}
		}
	}

	await walk(rootDir);
	return results;
}

export const GET: RequestHandler = async (event) => {
	await requireAdmin(event);

	// On disk, uploads live under static/uploads
	const rootDir = join(process.cwd(), 'static', 'uploads');

	let files: Array<{ path: string; size: number; mtime: string }>; 
	try {
		files = await listFilesRecursive(rootDir);
	} catch (err) {
		// If the uploads directory does not exist yet, just return empty list
		files = [];
	}

	return json({
		generatedAt: new Date().toISOString(),
		root: 'static/uploads',
		publicBase: '/uploads',
		files
	});
};
