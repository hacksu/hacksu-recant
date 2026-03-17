import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/admin';
import Handlebars from 'handlebars';

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);

	const body = await event.request.json();
	const {
		body: templateBody = '',
		subject = '',
		sharedVariables = {},
		recipientVariables = {},
		toAddresses = []
	} = body;

	// Build Handlebars context for the first recipient (index 0)
	const vars: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(sharedVariables as Record<string, string | string[]>)) {
		vars[k] = v;
	}

	const recipient: Record<string, string> = {};
	for (const [k, values] of Object.entries(recipientVariables as Record<string, string[]>)) {
		recipient[k] = values[0] ?? '';
	}

	try {
		const template = Handlebars.compile(templateBody);
		const html = template({ vars, recipient });
		return json({ html });
	} catch (err) {
		// Return raw body on compile error so the preview still shows something
		return json({ html: templateBody });
	}
};
