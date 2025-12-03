import { db } from '$lib/server/db';
import { location as locationTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async (event) => {
	// Admin check is handled by the layout

	const currentLocation = await db.query.location.findFirst({
		where: eq(locationTable.id, 'current')
	});

	return {
		location: currentLocation || null
	};
};

export const actions: Actions = {
	default: async (event) => {
		await requireAdmin(event);

		const formData = await event.request.formData();
		const time = formData.get('time')?.toString();
		const buildingRoom = formData.get('buildingRoom')?.toString();
		const buildingSelector = formData.get('buildingSelector')?.toString();
		const buildingUrl = formData.get('buildingUrl')?.toString();
		const body = formData.get('body')?.toString() || null;

		// Validation
		if (!time || !buildingRoom || !buildingSelector || !buildingUrl) {
			return fail(400, { error: 'All required fields must be filled' });
		}

		if (buildingSelector !== 'msb' && buildingSelector !== 'bowman') {
			return fail(400, { error: 'Building selector must be either "msb" or "bowman"' });
		}

		try {
			// Check if record exists
			const existing = await db.query.location.findFirst({
				where: eq(locationTable.id, 'current')
			});

			if (existing) {
				// Update existing record
				await db
					.update(locationTable)
					.set({
						time,
						buildingRoom,
						buildingSelector,
						buildingUrl,
						body,
						updatedAt: new Date()
					})
					.where(eq(locationTable.id, 'current'));
			} else {
				// Insert new record
				await db.insert(locationTable).values({
					id: 'current',
					time,
					buildingRoom,
					buildingSelector,
					buildingUrl,
					body,
				});
			}

			throw redirect(303, '/admin');
		} catch (error) {
			// Re-throw redirects and other SvelteKit errors
			if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
				throw error;
			}
			// Log the full error for debugging
			console.error('Database error saving location:', error);
			if (error && typeof error === 'object' && 'message' in error) {
				console.error('Error message:', error.message);
			}
			return fail(500, { 
				error: 'Failed to save location information',
				details: error instanceof Error ? error.message : String(error)
			});
		}
	}
};
