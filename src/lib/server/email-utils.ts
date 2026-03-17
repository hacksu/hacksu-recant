/**
 * Pure helper functions for email building and validation.
 */

/**
 * Builds a base64url-encoded RFC 2822 multipart/alternative message.
 */
export function buildRawMessage(opts: {
	from: string;
	to: string;
	cc?: string;
	bcc?: string;
	subject: string;
	html: string;
	text: string;
}): string {
	const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
	let msg = `From: ${opts.from}\r\n`;
	msg += `To: ${opts.to}\r\n`;
	if (opts.cc) msg += `Cc: ${opts.cc}\r\n`;
	if (opts.bcc) msg += `Bcc: ${opts.bcc}\r\n`;
	msg += `Subject: ${opts.subject}\r\n`;
	msg += `MIME-Version: 1.0\r\n`;
	msg += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;
	msg += `--${boundary}\r\n`;
	msg += `Content-Type: text/plain; charset=UTF-8\r\n`;
	msg += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
	msg += `${opts.text}\r\n\r\n`;
	msg += `--${boundary}\r\n`;
	msg += `Content-Type: text/html; charset=UTF-8\r\n`;
	msg += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
	msg += `${opts.html}\r\n\r\n`;
	msg += `--${boundary}--\r\n`;
	return Buffer.from(msg)
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

/**
 * Validates that every per-recipient variable has exactly one value per To address.
 * Returns an error string on mismatch, null on success.
 */
export function validateRecipientVars(
	recipientVariables: Record<string, string[]>,
	toAddresses: string[]
): string | null {
	for (const [name, values] of Object.entries(recipientVariables)) {
		if (values.length !== toAddresses.length) {
			return `Variable "${name}" has ${values.length} value(s) but there are ${toAddresses.length} recipient(s). Each per-recipient variable must have exactly one value per To address.`;
		}
	}
	return null;
}
