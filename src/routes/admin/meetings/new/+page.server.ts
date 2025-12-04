import { db } from '$lib/server/db';
import { meetings } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';


export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		await requireAdmin(event);

		const formData = await event.request.formData();

		const title = formData.get('title')?.toString();
		const dateStr = formData.get('date')?.toString();
		const presenter = formData.get('presenter')?.toString() || null;
		const link = formData.get('link')?.toString() || null;
		const descriptionMD = formData.get('descriptionMD')?.toString() || null;
		const photoFile = formData.get('photo') as File | null;

		// Validation
		if (!title || !dateStr) {
			return fail(400, { error: 'Title and date are required' });
		}

		const date = new Date(dateStr);
		if (isNaN(date.getTime())) {
			return fail(400, { error: 'Invalid date' });
		}


		let photoPath: string | null = null;

		// Handle photo upload
		if (photoFile && photoFile.size > 0) {
			try {
				// Create uploads directory if it doesn't exist
				const uploadsDir = join(process.cwd(), 'static', 'uploads', 'meetings');
				await mkdir(uploadsDir, { recursive: true });

				// Generate unique filename
				const fileExt = photoFile.name.split('.').pop() || 'jpg';
				const fileName = `${randomUUID()}.${fileExt}`;
				const filePath = join(uploadsDir, fileName);

				// Save file
				const arrayBuffer = await photoFile.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				await writeFile(filePath, buffer);

				// Store relative path for serving
				photoPath = `/uploads/meetings/${fileName}`;
			} catch (error) {
				console.error('Error uploading photo:', error);
				return fail(500, { error: 'Failed to upload photo' });
			}
		}

		try {
			const id = randomUUID();

			await db.insert(meetings).values({
				id,
				title,
				date,
				presenter,
				link,
				descriptionMD,
				photo: photoPath
			});

			throw redirect(303, '/admin/meetings');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
				throw error;
			}
			console.error('Database error creating event:', error);
			return fail(500, {
				error: 'Failed to create event',
				details: error instanceof Error ? error.message : String(error)
			});
		}
	}
};
