import { requireAdmin } from '$lib/server/admin';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { adminAuditLog } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);

	// Get audit logs, most recent first
	const logs = await db.query.adminAuditLog.findMany({
		orderBy: [desc(adminAuditLog.createdAt)],
		limit: 500 // Limit to most recent 500 entries
	});

	// Parse JSON fields
	const parsedLogs = logs.map((log) => ({
		...log,
		changesBefore: log.changesBefore ? JSON.parse(log.changesBefore) : null,
		changesAfter: log.changesAfter ? JSON.parse(log.changesAfter) : null
	}));

	return {
		logs: parsedLogs
	};
};

