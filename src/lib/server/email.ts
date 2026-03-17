import { google } from 'googleapis';
import { convert } from 'html-to-text';
import { env } from '$env/dynamic/private';
import { buildRawMessage, validateRecipientVars } from './email-utils';

// Re-export helpers so callers can import from a single location
export { buildRawMessage, validateRecipientVars };

const oauth2Client = new google.auth.OAuth2(
	env.GMAIL_CLIENT_ID,
	env.GMAIL_CLIENT_SECRET,
	'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({ refresh_token: env.GMAIL_REFRESH_TOKEN });

const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });

// ── Types ───────────────────────────────────────────────────────────────────

export interface SendEmailOptions {
	fromName: string;
	to: string;
	cc?: string[];
	bcc?: string[];
	subject: string;
	html: string;
}

/**
 * Sends a single email via the Gmail API.
 * Throws on Gmail API failure — caller is responsible for catching and returning a form error.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<void> {
	const fromAddress = env.GMAIL_FROM;
	const from = `${opts.fromName} <${fromAddress}>`;
	const text = convert(opts.html, { wordwrap: 80 });

	const raw = buildRawMessage({
		from,
		to: opts.to,
		cc: opts.cc?.join(', '),
		bcc: opts.bcc?.join(', '),
		subject: opts.subject,
		html: opts.html,
		text
	});

	await gmailClient.users.messages.send({
		userId: 'me',
		requestBody: { raw }
	});
}
