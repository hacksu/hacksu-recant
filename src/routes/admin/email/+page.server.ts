import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { emailTemplates, emailDrafts } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';
import { logAdminAction } from '$lib/server/audit';
import { sendEmail, validateRecipientVars } from '$lib/server/email';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import Handlebars from 'handlebars';
import { convert } from 'html-to-text';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async (event) => {
	await requireAdmin(event);
	const [templates, drafts] = await Promise.all([
		db.select().from(emailTemplates).orderBy(emailTemplates.updatedAt),
		db.select().from(emailDrafts).orderBy(emailDrafts.updatedAt)
	]);
	return { templates, drafts, gmailFrom: env.GMAIL_FROM ?? '' };
};

export const actions: Actions = {
	send: async (event) => {
		await requireAdmin(event);
		const data = await event.request.formData();

		const fromName = data.get('fromName')?.toString().trim() || 'HacKSU Team';
		const toRaw = data.get('toAddresses')?.toString() || '';
		const ccRaw = data.get('ccAddresses')?.toString() || '';
		const bccRaw = data.get('bccAddresses')?.toString() || '';
		const subject = data.get('subject')?.toString() || '';
		const body = data.get('body')?.toString() || '';
		let sharedVariables: Record<string, string | string[]>;
		let recipientVariables: Record<string, string[]>;
		try {
			sharedVariables = JSON.parse(data.get('sharedVariables')?.toString() || '{}');
			recipientVariables = JSON.parse(data.get('recipientVariables')?.toString() || '{}');
		} catch {
			return fail(400, { error: 'Invalid variable data format.' });
		}

		const toAddresses = toRaw.split(',').map((e) => e.trim()).filter(Boolean);
		const ccAddresses = ccRaw.split(',').map((e) => e.trim()).filter(Boolean);
		const bccAddresses = bccRaw.split(',').map((e) => e.trim()).filter(Boolean);

		if (toAddresses.length === 0) {
			return fail(400, { error: 'At least one recipient is required in the To field.' });
		}

		const validationError = validateRecipientVars(recipientVariables, toAddresses);
		if (validationError) {
			return fail(400, { error: validationError });
		}

		// Render and send one email per To address
		const renderedBodies: { to: string; html: string; text: string }[] = [];

		try {
			for (let i = 0; i < toAddresses.length; i++) {
				const recipient: Record<string, string> = {};
				for (const [k, values] of Object.entries(recipientVariables)) {
					recipient[k] = values[i] ?? '';
				}

				const context = { vars: sharedVariables, recipient };
				const renderedSubject = Handlebars.compile(subject)(context);
				const renderedHtml = Handlebars.compile(body)(context);
				const renderedText = convert(renderedHtml, { wordwrap: 80 });

				await sendEmail({
					fromName,
					to: toAddresses[i],
					// CC/BCC only on single-recipient sends (enforced client-side, double-checked here)
					cc: toAddresses.length === 1 ? ccAddresses : undefined,
					bcc: toAddresses.length === 1 ? bccAddresses : undefined,
					subject: renderedSubject,
					html: renderedHtml
				});

				renderedBodies.push({ to: toAddresses[i], html: renderedHtml, text: renderedText });
			}
		} catch (err) {
			console.error('Gmail send error:', err);
			const message = err instanceof Error ? err.message : String(err);
			return fail(500, { error: `Failed to send email: ${message}` });
		}

		// Truncate rendered bodies to 50 KB each before audit logging
		const MAX_BODY_BYTES = 50 * 1024;
		const truncate = (s: string) => {
			const buf = Buffer.from(s);
			return buf.byteLength > MAX_BODY_BYTES
				? buf.slice(0, MAX_BODY_BYTES).toString() + '\n[truncated]'
				: s;
		};
		const auditBodies = renderedBodies.map((b) => ({
			to: b.to,
			html: truncate(b.html),
			text: truncate(b.text)
		}));

		await logAdminAction(event, {
			action: 'CREATE',
			resourceType: 'email',
			resourceId: randomUUID(),
			routePath: event.url.pathname,
			changesAfter: {
				subject,
				toAddresses,
				fromName,
				ccAddresses,
				bccAddresses,
				sharedVariables,
				recipientVariables,
				renderedBodies: auditBodies
			}
		});

		return { success: true, count: toAddresses.length };
	},

	saveDraft: async (event) => {
		await requireAdmin(event);
		const data = await event.request.formData();
		const id = data.get('id')?.toString() || randomUUID();
		const name = data.get('name')?.toString().trim() || 'Untitled Draft';

		let draftFields: {
			toAddresses: string[]; ccAddresses: string[]; bccAddresses: string[];
			sharedVariables: Record<string, unknown>; recipientVariables: Record<string, unknown>;
		};
		try {
			draftFields = {
				toAddresses: JSON.parse(data.get('toAddresses')?.toString() || '[]'),
				ccAddresses: JSON.parse(data.get('ccAddresses')?.toString() || '[]'),
				bccAddresses: JSON.parse(data.get('bccAddresses')?.toString() || '[]'),
				sharedVariables: JSON.parse(data.get('sharedVariables')?.toString() || '{}'),
				recipientVariables: JSON.parse(data.get('recipientVariables')?.toString() || '{}')
			};
		} catch {
			return fail(400, { error: 'Invalid draft data format.' });
		}

		const draft = {
			id,
			name,
			subject: data.get('subject')?.toString() || '',
			body: data.get('body')?.toString() || '',
			fromName: data.get('fromName')?.toString() || '',
			...draftFields,
			updatedAt: new Date()
		};

		await db.insert(emailDrafts)
			.values({ ...draft, createdAt: new Date() })
			.onConflictDoUpdate({ target: emailDrafts.id, set: { ...draft } });

		return { success: true, id };
	},

	deleteDraft: async (event) => {
		await requireAdmin(event);
		const data = await event.request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing id' });
		await db.delete(emailDrafts).where(eq(emailDrafts.id, id));
		return { success: true };
	},

	saveTemplate: async (event) => {
		await requireAdmin(event);
		const data = await event.request.formData();
		const id = data.get('id')?.toString() || randomUUID();
		const name = data.get('name')?.toString().trim();
		if (!name) return fail(400, { error: 'Template name is required' });

		let variableNames: unknown[];
		try {
			variableNames = JSON.parse(data.get('variableNames')?.toString() || '[]');
		} catch {
			return fail(400, { error: 'Invalid variable names format.' });
		}

		const template = {
			id,
			name,
			subject: data.get('subject')?.toString() || '',
			body: data.get('body')?.toString() || '',
			variableNames,
			updatedAt: new Date()
		};

		await db.insert(emailTemplates)
			.values({ ...template, createdAt: new Date() })
			.onConflictDoUpdate({ target: emailTemplates.id, set: { ...template } });

		return { success: true, id };
	},

	deleteTemplate: async (event) => {
		await requireAdmin(event);
		const data = await event.request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing id' });
		await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
		return { success: true };
	}
};
