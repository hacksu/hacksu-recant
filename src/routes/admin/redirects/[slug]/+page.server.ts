import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { redirects } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { eq } from 'drizzle-orm';

function isValidSlug(slug: string): boolean {
	return /^[a-zA-Z0-9_-]+$/.test(slug);
}

function isValidUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);
	const slug = event.params.slug;

	const item = await db.query.redirects.findFirst({
		where: (r, { eq }) => eq(r.slug, slug)
	});

	if (!item) {
		throw redirect(303, '/admin/redirects');
	}

	return {
		redirect: item
	};
};

export const actions: Actions = {
	default: async (event) => {
		await requireAdmin(event);
		const originalSlug = event.params.slug;
		const formData = await event.request.formData();

		const slug = formData.get('slug')?.toString().trim();
		const targetUrl = formData.get('targetUrl')?.toString().trim();
		const description = formData.get('description')?.toString().trim() || null;
		const enabledStr = formData.get('enabled')?.toString();
		const enabled = enabledStr === 'on' || enabledStr === 'true' || enabledStr === '1';

		if (!slug || !targetUrl) {
			return fail(400, { error: 'Slug and target URL are required' });
		}

		if (!isValidSlug(slug)) {
			return fail(400, { error: 'Slug may only contain letters, numbers, dashes, and underscores' });
		}

		if (!isValidUrl(targetUrl)) {
			return fail(400, { error: 'Target URL must be a valid http(s) URL' });
		}

		// If slug changed, ensure the new slug is unique
		if (slug !== originalSlug) {
			const existing = await db.query.redirects.findFirst({
				where: (r, { eq }) => eq(r.slug, slug)
			});

			if (existing) {
				return fail(400, { error: 'Slug is already in use' });
			}
		}

		try {
			await db
				.update(redirects)
				.set({ slug, targetUrl, description, enabled })
				.where(eq(redirects.slug, originalSlug));

			throw redirect(303, '/admin/redirects');
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
				throw error;
			}
			console.error('Error updating redirect:', error);
			return fail(500, {
				error: 'Failed to update redirect',
				details: error instanceof Error ? error.message : String(error)
			});
		}
	}
};
