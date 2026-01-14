import { db } from '$lib/server/db';
import { leadership } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	const id = event.params.id;
	const leader = await db.query.leadership.findFirst({
		where: eq(leadership.id, id)
	});

	if (!leader) {
		throw redirect(303, '/admin/leadership');
	}

	return {
		leader
	};
};

export const actions: Actions = {
	default: async (event) => {
		await requireAdmin(event);

		const id = event.params.id;
		const formData = await event.request.formData();

		const name = formData.get('name')?.toString();
		const gradYearStr = formData.get('gradYear')?.toString();
		const gradTerm = formData.get('gradTerm')?.toString();
		const github = formData.get('github')?.toString() || null;
		const photoFile = formData.get('photo') as File | null;
		const titlesStr = formData.get('titles')?.toString();
		const link = formData.get('link')?.toString() || null;
		const sortOrder = formData.get('sortOrder');
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
			const existing = await db.query.leadership.findFirst({
				where: eq(leadership.id, id)
			});

			if (!existing) {
				return fail(404, { error: 'Leader not found' });
			}

			// Update record - only update photo if a new one was uploaded
			const updateData: {
				name: string;
				gradYear: number;
				gradTerm: string;
				github: string | null;
				photo?: string | null;
				titles: string[];
				link: string | null;
				isCurrent: boolean;
			} = {
				name,
				gradYear,
				gradTerm,
				github,
				titles,
				link,
				isCurrent
			};

			if (photoPath !== null) {
				updateData.photo = photoPath;
			}

			await db.update(leadership).set(updateData).where(eq(leadership.id, id));

			throw redirect(303, '/admin/leadership');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
				throw error;
			}
			console.error('Database error updating leader:', error);
			return fail(500, {
				error: 'Failed to update leader',
				details: error instanceof Error ? error.message : String(error)
			});
		}
	}
};