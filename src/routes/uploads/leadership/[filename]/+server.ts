import { readFile } from 'fs/promises';
import { join } from 'path';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const filename = params.filename;

	if (!filename) {
		throw error(400, 'Filename is required');
	}

	try {
		// Security: prevent directory traversal
		if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
			throw error(400, 'Invalid filename');
		}

		// Read file from static/uploads/leadership directory
		const filePath = join(process.cwd(), 'static', 'uploads', 'leadership', filename);

		const fileBuffer = await readFile(filePath);

		// Determine content type based on file extension
		const ext = filename.split('.').pop()?.toLowerCase();
		const contentType =
			ext === 'jpg' || ext === 'jpeg'
				? 'image/jpeg'
				: ext === 'png'
					? 'image/png'
					: ext === 'gif'
						? 'image/gif'
						: ext === 'webp'
							? 'image/webp'
							: 'application/octet-stream';

		return new Response(fileBuffer, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
			}
		});
	} catch (err) {
		// If file doesn't exist, return 404
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
			throw error(404, 'File not found');
		}
		console.error('Error serving file:', err);
		throw error(500, 'Error serving file');
	}
};