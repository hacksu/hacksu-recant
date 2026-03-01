import { db } from '$lib/server/db';
import { courseSchedule } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { asc } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	const courses = await db.query.courseSchedule.findMany({
		orderBy: [asc(courseSchedule.code)]
	});

	return { courses };
};

export const actions: Actions = {
	refresh: async (event) => {
		await requireAdmin(event);

		const serviceUrl = env.SCHEDULE_SERVICE_URL ?? 'http://localhost:8000';

		let scraped: Array<{
			code: string;
			name: string;
			day?: string;
			time?: string;
			lecturer?: string;
			location?: string;
			email?: string;
		}>;

		try {
			const response = await fetch(`${serviceUrl}/scrape`, {
				signal: AbortSignal.timeout(120_000)
			});
			if (!response.ok) {
				const detail = await response.json().catch(() => ({}));
				return fail(502, { error: `Schedule service error: ${detail?.detail ?? response.status}` });
			}
			scraped = await response.json();
		} catch (e) {
			if (e instanceof Error && e.name === 'TimeoutError') {
				return fail(502, { error: 'Schedule service timed out. Try again.' });
			}
			return fail(502, { error: 'Could not reach the schedule service. Is it running?' });
		}

		const scrapedAt = new Date();

		await db.delete(courseSchedule);
		await db.insert(courseSchedule).values(
			scraped.map((c) => ({
				id: randomUUID(),
				code: c.code,
				name: c.name,
				day: c.day ?? null,
				time: c.time ?? null,
				lecturer: c.lecturer ?? null,
				location: c.location ?? null,
				email: c.email ?? null,
				scrapedAt
			}))
		);

		redirect(303, '/admin/schedule');
	}
};
