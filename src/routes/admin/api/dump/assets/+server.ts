import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import { readdir, stat, writeFile, mkdir } from 'fs/promises';
import { join, relative, dirname } from 'path';

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

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);

	const formData = await event.request.formData();
	const relPath = formData.get('path')?.toString();
	const file = formData.get('file') as File | null;

	if (!relPath || !file) {
		return json({ ok: false, error: 'Missing path or file' }, { status: 400 });
	}

	// Basic path validation to prevent directory traversal
	if (relPath.includes('..') || relPath.startsWith('/') || relPath.includes('\\')) {
		return json({ ok: false, error: 'Invalid path' }, { status: 400 });
	}

	const uploadsRoot = join(process.cwd(), 'static', 'uploads');
	const destPath = join(uploadsRoot, relPath);

	// Ensure directory exists
	await mkdir(dirname(destPath), { recursive: true });

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	await writeFile(destPath, buffer);

	return json({
		ok: true,
		savedAt: new Date().toISOString(),
		path: relPath
	});
};

