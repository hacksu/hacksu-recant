import type { RequestHandler } from './$types';
import { redirect as svelteRedirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { redirects } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, url }) => {
	const slug = params.slug;

	if (!slug) {
		// No slug provided, just go to the listing page
		throw svelteRedirect(302, '/redir');
	}

	// Look up enabled redirect by slug
	const item = await db.query.redirects.findFirst({
		where: (r, { eq, and }) => and(eq(r.slug, slug), eq(r.enabled, true))
	});

	if (!item) {
		// No such redirect (or disabled) — send to listing page with hint
		const search = new URLSearchParams(url.searchParams);
		search.set('missing', slug);
		throw svelteRedirect(302, `/redir?${search.toString()}`);
	}

	// Best-effort increment of click counter; don't block the redirect on failure
	try {
		await db
			.update(redirects)
			.set({ clicks: item.clicks + 1 })
			.where(and(eq(redirects.slug, slug), eq(redirects.enabled, true)));
	} catch {
		// ignore tracking errors
	}

	// Use a temporary redirect so browsers don't over-cache
	throw svelteRedirect(307, item.targetUrl);
};
