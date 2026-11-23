import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { meetings, siteSettings, DEFAULT_MEETING_POSTER_KEY } from '$lib/server/db/schema';
import { and, asc, eq, gte, isNotNull } from 'drizzle-orm';

// Returns the poster/TV/marketing image for the next upcoming meeting (meetings.poster_photo),
// the same meeting the landing page shows. If it has no poster, falls back to the default
// poster set at /admin/meetings/default-poster.
export const GET: RequestHandler = async ({ url }) => {
	const meeting = await db.query.meetings.findFirst({
		where: and(gte(meetings.date, new Date()), isNotNull(meetings.posterPhoto)),
		orderBy: [asc(meetings.date)]
	});

	if (meeting?.posterPhoto) {
		return json({
			isDefault: false,
			meetingId: meeting.id,
			title: meeting.title,
			date: meeting.date,
			presenter: meeting.presenter,
			// Relative path, e.g. /uploads/meetings/<filename> — use this from pages on this site
			path: meeting.posterPhoto,
			// Absolute URL for external clients (depends on the server's configured origin)
			url: new URL(meeting.posterPhoto, url.origin).href
		});
	}

	const fallback = await db.query.siteSettings.findFirst({
		where: eq(siteSettings.key, DEFAULT_MEETING_POSTER_KEY)
	});

	if (!fallback?.value) {
		throw error(404, 'No upcoming meeting poster and no default poster set');
	}

	return json({
		isDefault: true,
		meetingId: null,
		title: null,
		date: null,
		presenter: null,
		path: fallback.value,
		url: new URL(fallback.value, url.origin).href
	});
};
