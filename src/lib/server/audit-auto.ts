import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { adminAuditLog } from '$lib/server/db/schema';
import { getAdminUser, getAdminUserInfo } from './admin';
import { randomUUID } from 'crypto';
import {
	information,
	leadership,
	meetings,
	notes,
	redirects,
	location as locationTable,
	lessonIcons
} from './db/schema';
import { eq } from 'drizzle-orm';

type ResourceType = 
	| 'information' 
	| 'leadership' 
	| 'meetings' 
	| 'notes' 
	| 'redirects' 
	| 'location' 
	| 'lesson-icons';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

interface RouteMapping {
	pattern: RegExp;
	resourceType: ResourceType;
	getResourceId: (pathname: string, params: Record<string, string>) => string | null;
	getTable: () => any;
}

/**
 * Maps admin routes to their resource types and how to extract resource IDs
 */
const routeMappings: RouteMapping[] = [
	{
		pattern: /^\/admin\/information\/([^\/]+)\/delete$/,
		resourceType: 'information',
		getResourceId: (pathname, params) => params.id || pathname.split('/')[3] || null,
		getTable: () => information
	},
	{
		pattern: /^\/admin\/information\/([^\/]+)$/,
		resourceType: 'information',
		getResourceId: (pathname, params) => params.id || pathname.split('/')[3] || null,
		getTable: () => information
	},
	{
		pattern: /^\/admin\/information\/new$/,
		resourceType: 'information',
		getResourceId: () => null, // Will be created
		getTable: () => information
	},
	{
		pattern: /^\/admin\/leadership\/([^\/]+)\/delete$/,
		resourceType: 'leadership',
		getResourceId: (pathname, params) => params.id || pathname.split('/')[3] || null,
		getTable: () => leadership
	},
	{
		pattern: /^\/admin\/leadership\/([^\/]+)$/,
		resourceType: 'leadership',
		getResourceId: (pathname, params) => params.id || pathname.split('/')[3] || null,
		getTable: () => leadership
	},
	{
		pattern: /^\/admin\/leadership\/new$/,
		resourceType: 'leadership',
		getResourceId: () => null,
		getTable: () => leadership
	},
	{
		pattern: /^\/admin\/meetings\/([^\/]+)\/delete$/,
		resourceType: 'meetings',
		getResourceId: (pathname, params) => params.id || pathname.split('/')[3] || null,
		getTable: () => meetings
	},
	{
		pattern: /^\/admin\/meetings\/([^\/]+)$/,
		resourceType: 'meetings',
		getResourceId: (pathname, params) => params.id || pathname.split('/')[3] || null,
		getTable: () => meetings
	},
	{
		pattern: /^\/admin\/meetings\/new$/,
		resourceType: 'meetings',
		getResourceId: () => null,
		getTable: () => meetings
	},
	{
		pattern: /^\/admin\/notes\/([^\/]+)\/delete$/,
		resourceType: 'notes',
		getResourceId: (pathname, params) => params.id || pathname.split('/')[3] || null,
		getTable: () => notes
	},
	{
		pattern: /^\/admin\/notes\/([^\/]+)$/,
		resourceType: 'notes',
		getResourceId: (pathname, params) => params.id || pathname.split('/')[3] || null,
		getTable: () => notes
	},
	{
		pattern: /^\/admin\/notes\/new$/,
		resourceType: 'notes',
		getResourceId: () => null,
		getTable: () => notes
	},
	{
		pattern: /^\/admin\/redirects\/([^\/]+)\/delete$/,
		resourceType: 'redirects',
		getResourceId: (pathname, params) => params.slug || pathname.split('/')[3] || null,
		getTable: () => redirects
	},
	{
		pattern: /^\/admin\/redirects\/([^\/]+)$/,
		resourceType: 'redirects',
		getResourceId: (pathname, params) => params.slug || pathname.split('/')[3] || null,
		getTable: () => redirects
	},
	{
		pattern: /^\/admin\/redirects\/new$/,
		resourceType: 'redirects',
		getResourceId: () => null,
		getTable: () => redirects
	},
	{
		pattern: /^\/admin\/location$/,
		resourceType: 'location',
		getResourceId: () => 'current',
		getTable: () => locationTable
	},
	{
		pattern: /^\/admin\/lesson-icons\/api\/([^\/]+)$/,
		resourceType: 'lesson-icons',
		getResourceId: (pathname, params) => params.categoryName || pathname.split('/')[4] || null,
		getTable: () => lessonIcons
	},
	{
		pattern: /^\/admin\/lesson-icons\/api$/,
		resourceType: 'lesson-icons',
		getResourceId: () => null,
		getTable: () => lessonIcons
	},
	{
		pattern: /^\/admin\/lesson-icons\/([^\/]+)\/delete$/,
		resourceType: 'lesson-icons',
		getResourceId: (pathname, params) => params.categoryName || pathname.split('/')[3] || null,
		getTable: () => lessonIcons
	}
];

/**
 * Find the route mapping for a given pathname
 */
function findRouteMapping(pathname: string, params: Record<string, string>): RouteMapping | null {
	for (const mapping of routeMappings) {
		if (mapping.pattern.test(pathname)) {
			return mapping;
		}
	}
	return null;
}

/**
 * Get the action type from HTTP method and route pattern
 */
function getActionType(method: string, pathname: string, resourceId: string | null): AuditAction {
	if (method === 'DELETE' || pathname.includes('/delete')) {
		return 'DELETE';
	}
	if (method === 'POST' && pathname.includes('/new')) {
		return 'CREATE';
	}
	if (method === 'POST' && pathname.includes('/api') && !resourceId) {
		return 'CREATE';
	}
	if (method === 'PUT') {
		return 'UPDATE';
	}
	// Default to UPDATE for POST requests to edit routes
	return 'UPDATE';
}

/**
 * Fetch resource data from database
 */
async function fetchResourceData(
	table: any,
	resourceType: ResourceType,
	resourceId: string | null
): Promise<Record<string, any> | null> {
	if (!resourceId) {
		return null;
	}

	try {
		if (resourceType === 'redirects') {
			const result = await db.query.redirects.findFirst({
				where: eq(table.slug, resourceId)
			});
			return result ? { ...result, date: result.createdAt?.toISOString(), date2: result.updatedAt?.toISOString() } : null;
		} else if (resourceType === 'location') {
			const result = await db.query.location.findFirst({
				where: eq(table.id, resourceId)
			});
			return result ? { ...result, date: result.createdAt?.toISOString(), date2: result.updatedAt?.toISOString() } : null;
		} else if (resourceType === 'lesson-icons') {
			const result = await db.query.lessonIcons.findFirst({
				where: eq(table.categoryName, resourceId)
			});
			return result ? { ...result, date: result.createdAt?.toISOString(), date2: result.updatedAt?.toISOString() } : null;
		} else {
			// For other types, use id field - handle each type explicitly
			let result: any = null;
			if (resourceType === 'information') {
				result = await db.query.information.findFirst({
					where: eq(table.id, resourceId)
				});
			} else if (resourceType === 'leadership') {
				result = await db.query.leadership.findFirst({
					where: eq(table.id, resourceId)
				});
			} else if (resourceType === 'meetings') {
				result = await db.query.meetings.findFirst({
					where: eq(table.id, resourceId)
				});
			} else if (resourceType === 'notes') {
				result = await db.query.notes.findFirst({
					where: eq(table.id, resourceId)
				});
			}
			
			if (!result) return null;
			
			// Convert dates to ISO strings for JSON serialization
			const serialized: Record<string, any> = { ...result };
			if ('date' in result && result.date instanceof Date) {
				serialized.date = result.date.toISOString();
			}
			if ('createdAt' in result && result.createdAt instanceof Date) {
				serialized.createdAt = result.createdAt.toISOString();
			}
			if ('updatedAt' in result && result.updatedAt instanceof Date) {
				serialized.updatedAt = result.updatedAt.toISOString();
			}
			return serialized;
		}
	} catch (error) {
		console.error('Error fetching resource data for audit:', error);
		return null;
	}
}

/**
 * Extract form data changes from the request
 * Clones the request to avoid consuming the body
 */
async function extractFormData(event: RequestEvent, cloneRequest = false): Promise<Record<string, any> | null> {
	try {
		if (event.request.method === 'POST' || event.request.method === 'PUT') {
			const contentType = event.request.headers.get('content-type') || '';
			
			// Clone the request if we need to read it without consuming the original body
			const requestToRead = cloneRequest ? event.request.clone() : event.request;
			
			if (contentType.includes('application/json')) {
				const json = await requestToRead.json();
				return json;
			} else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
				const formData = await requestToRead.formData();
				const data: Record<string, any> = {};
				for (const [key, value] of formData.entries()) {
					// Handle arrays (like titles)
					if (data[key]) {
						if (Array.isArray(data[key])) {
							data[key].push(value);
						} else {
							data[key] = [data[key], value];
						}
					} else {
						// Convert File objects to a simple representation
						if (value instanceof File) {
							data[key] = {
								name: value.name,
								size: value.size,
								type: value.type,
								_isFile: true
							};
						} else {
							data[key] = value;
						}
					}
				}
				return data;
			}
		}
		return null;
	} catch (error) {
		console.error('Error extracting form data:', error);
		return null;
	}
}

/**
 * Capture before state for admin actions
 * Called BEFORE the route handler executes
 */
export async function captureBeforeState(event: RequestEvent): Promise<void> {
	// Only capture for admin routes with actions
	if (!event.url.pathname.startsWith('/admin')) {
		return;
	}

	const method = event.request.method;
	if (!['POST', 'PUT', 'DELETE'].includes(method)) {
		return;
	}

	if (event.url.pathname.includes('/audit-log')) {
		return;
	}

	try {
		const adminUserId = await getAdminUser(event);
		if (!adminUserId) {
			return;
		}

		const pathname = event.url.pathname;
		const mapping = findRouteMapping(pathname, event.params || {});
		
		if (!mapping) {
			return;
		}

		const resourceId = mapping.getResourceId(pathname, event.params || {});
		const action = getActionType(method, pathname, resourceId);

		// Store mapping info for later use
		event.locals.auditMapping = {
			resourceType: mapping.resourceType,
			resourceId: resourceId || null,
			action
		};

		// Capture before state for UPDATE and DELETE
		if (action === 'UPDATE' || action === 'DELETE') {
			const table = mapping.getTable();
			const beforeState = await fetchResourceData(table, mapping.resourceType, resourceId);
			event.locals.auditBeforeState = beforeState;
		} else {
			event.locals.auditBeforeState = null;
		}

		// Capture form data for CREATE actions (before request body is consumed)
		// We clone the request to avoid consuming the body before the handler runs
		if (action === 'CREATE') {
			const formData = await extractFormData(event, true); // Clone the request
			event.locals.auditFormData = formData;
		} else {
			event.locals.auditFormData = null;
		}
	} catch (error) {
		console.error('Failed to capture before state:', error);
		event.locals.auditBeforeState = null;
		event.locals.auditFormData = null;
		event.locals.auditMapping = null;
	}
}

/**
 * Automatically log admin actions
 * This function is called AFTER the route handler executes
 */
export async function autoLogAdminAction(event: RequestEvent): Promise<void> {
	// Only log admin routes
	if (!event.url.pathname.startsWith('/admin')) {
		return;
	}

	// Only log POST, PUT, DELETE methods (actions)
	const method = event.request.method;
	if (!['POST', 'PUT', 'DELETE'].includes(method)) {
		return;
	}

	// Skip audit log route itself to avoid recursion
	if (event.url.pathname.includes('/audit-log')) {
		return;
	}

	try {
		const adminUserInfo = await getAdminUserInfo(event);
		if (!adminUserInfo) {
			return; // Not an admin action
		}
		const adminUserId = adminUserInfo.userId;
		const adminUsername = adminUserInfo.username;

		const pathname = event.url.pathname;
		const mapping = findRouteMapping(pathname, event.params || {});
		
		if (!mapping) {
			// Unknown route, skip logging
			return;
		}

		// Use stored mapping info if available (from before state capture)
		const storedMapping = event.locals.auditMapping;
		const resourceId = storedMapping?.resourceId ?? mapping.getResourceId(pathname, event.params || {});
		const action = storedMapping?.action ?? getActionType(method, pathname, resourceId);
		const table = mapping.getTable();

		// Use before state captured earlier
		const changesBefore = event.locals.auditBeforeState ?? null;
		let changesAfter: Record<string, any> | null = null;

		if (action === 'DELETE') {
			// For DELETE, after state is null
			changesAfter = null;
		} else if (action === 'UPDATE') {
			// For UPDATE, fetch current state (after the update)
			changesAfter = await fetchResourceData(table, mapping.resourceType, resourceId);
		} else if (action === 'CREATE') {
			// For CREATE, use form data captured before handler ran
			const formData = event.locals.auditFormData;
			let newResourceId = resourceId;
			
			// Try to find the ID in form data (some routes generate UUIDs)
			if (!newResourceId && formData) {
				// Check common ID field names
				newResourceId = formData.id || formData.slug || formData.categoryName || null;
			}
			
			// First try to fetch from database if we have an ID (after creation)
			if (newResourceId) {
				const fetchedData = await fetchResourceData(table, mapping.resourceType, newResourceId);
				if (fetchedData) {
					changesAfter = fetchedData;
				} else if (formData) {
					// If fetch failed, use form data as fallback
					changesAfter = formData;
				}
			} else if (formData) {
				// No ID available, use form data
				changesAfter = formData;
			}
			
			// Ensure we always have something to show for CREATE actions
			if (!changesAfter && formData) {
				changesAfter = formData;
			}
		}

		// Log the action
		const ipAddress = event.getClientAddress();
		const userAgent = event.request.headers.get('user-agent') || null;

		await db.insert(adminAuditLog).values({
			id: randomUUID(),
			adminUserId,
			adminUsername,
			action,
			resourceType: mapping.resourceType,
			resourceId: resourceId || null,
			routePath: pathname,
			changesBefore: changesBefore ? JSON.stringify(changesBefore) : null,
			changesAfter: changesAfter ? JSON.stringify(changesAfter) : null,
			ipAddress,
			userAgent,
			createdAt: new Date()
		});
	} catch (error) {
		// Don't throw - audit logging failures shouldn't break the app
		console.error('Failed to auto-log admin action:', error);
	}
}

