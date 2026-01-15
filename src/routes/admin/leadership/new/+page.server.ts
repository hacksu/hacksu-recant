import { db } from '$lib/server/db';
import { leadership } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, RequestEvent } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export const load = async (event: RequestEvent) => {
	await requireAdmin(event);
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		await requireAdmin(event);

		const formData = await event.request.formData();

		const name = formData.get('name')?.toString();
		const gradYearStr = formData.get('gradYear')?.toString();
		const gradTerm = formData.get('gradTerm')?.toString();
		const github = formData.get('github')?.toString() || null;
		const photoFile = formData.get('photo') as File | null;
		const titlesStr = formData.get('titles')?.toString();
		const link = formData.get('link')?.toString() || null;
		const sortOrderStr = formData.get('sortOrder')?.toString() || "1";
		const isCurrent = formData.get('isCurrent') === 'on';

		// Validation
		if (!name || !gradYearStr || !gradTerm || !titlesStr) {
			return fail(400, { error: 'Name, graduation year, term, and titles are required' });
		}

		const gradYear = parseInt(gradYearStr, 10);
		if (isNaN(gradYear) || gradYear < 1900 || gradYear > 2100) {
			return fail(400, { error: 'Invalid graduation year' });
		}

		if (gradTerm !== 'Spring' && gradTerm !== 'Fall') {
			return fail(400, { error: 'Graduation term must be either "Spring" or "Fall"' });
		}

		const titles = titlesStr
			.split(',')
			.map((t) => t.trim())
			.filter((t) => t.length > 0);

		if (titles.length === 0) {
			return fail(400, { error: 'At least one title is required' });
		}

		const sortOrder = parseInt(sortOrderStr, 10);
		if (isNaN(sortOrder)) {
			return fail(400, { error: 'Invalid sort order' });
		}

		let photoPath: string | null = null;

		// Handle photo upload
		if (photoFile && photoFile.size > 0) {
			try {
				// Create uploads directory if it doesn't exist
				const uploadsDir = join(process.cwd(), 'static', 'uploads', 'leadership');
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
				photoPath = `/uploads/leadership/${fileName}`;
			} catch (error) {
				console.error('Error uploading photo:', error);
				return fail(500, { error: 'Failed to upload photo' });
			}
		}

		try {
			const id = randomUUID();

			await db.insert(leadership).values({
				id,
				name,
				gradYear,
				gradTerm,
				github,
				photo: photoPath,
				titles,
				link,
				sortOrder,
				isCurrent
			});

			throw redirect(303, '/admin/leadership');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
				throw error;
			}
			console.error('Database error creating leader:', error);
			return fail(500, {
				error: 'Failed to create leader',
				details: error instanceof Error ? error.message : String(error)
			});
		}
	}
};