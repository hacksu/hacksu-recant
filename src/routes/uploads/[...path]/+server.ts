import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Generic catch-all uploads route. Serves any file under static/uploads/**
// while still allowing the more specific /uploads/leadership and
// /uploads/meetings routes to take precedence.

export const GET: RequestHandler = async ({ params }) => {
	const path = params.path; // e.g. "leadership/abc.png" or "events/old.png"

	if (!path) {
		throw error(400, 'Path is required');
	}

    // Thanks, Noah! 
    if (!/^[a-zA-Z0-9._\/-]+$/.test(path)) throw error(400, 'Invalid chars');

    const uploadsDir = resolve(process.cwd(), 'static', 'uploads');
    const filePath = resolve(uploadsDir, path);

    if (!filePath.startsWith(uploadsDir + '/')) throw error(400, 'Escape attempt');

	try {
		// Read file from static/uploads/<path>
		const filePath = join(process.cwd(), 'static', 'uploads', path);
		const fileBuffer = await readFile(filePath);

		// Determine content type based on file extension
		const ext = path.split('.').pop()?.toLowerCase();
        // Some of my worst code ever, I'm sorry to whomever has to read this
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
		console.error('Error serving upload file:', err);
		throw error(500, 'Error serving file');
	}
};
