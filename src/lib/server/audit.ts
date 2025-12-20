import { db } from '$lib/server/db';
import { adminAuditLog } from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { getAdminUser } from './admin';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type ResourceType = 
	| 'information' 
	| 'leadership' 
	| 'meetings' 
	| 'notes' 
	| 'redirects' 
	| 'location' 
	| 'lesson-icons';

interface AuditLogOptions {
	action: AuditAction;
	resourceType: ResourceType;
	resourceId?: string | null;
	routePath: string;
	changesBefore?: Record<string, any> | null;
	changesAfter?: Record<string, any> | null;
}

/**
 * Log an admin action to the audit log
 * This function should be called after any admin action (CREATE, UPDATE, DELETE)
 */
export async function logAdminAction(
	event: RequestEvent,
	options: AuditLogOptions
): Promise<void> {
	try {
		const adminUserId = await getAdminUser(event);
		
		// Only log if we have an admin user
		if (!adminUserId) {
			return;
		}

		const ipAddress = event.getClientAddress();
		const userAgent = event.request.headers.get('user-agent') || null;

		await db.insert(adminAuditLog).values({
			id: randomUUID(),
			adminUserId,
			action: options.action,
			resourceType: options.resourceType,
			resourceId: options.resourceId || null,
			routePath: options.routePath,
			changesBefore: options.changesBefore ? JSON.stringify(options.changesBefore) : null,
			changesAfter: options.changesAfter ? JSON.stringify(options.changesAfter) : null,
			ipAddress,
			userAgent,
			createdAt: new Date()
		});
	} catch (error) {
		// Don't throw - audit logging failures shouldn't break the app
		console.error('Failed to log admin action:', error);
	}
}

/**
 * Helper to get the current route path from a RequestEvent
 */
export function getRoutePath(event: RequestEvent): string {
	return event.url.pathname;
}

