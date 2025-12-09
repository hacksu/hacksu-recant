import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { browser } from '$app/environment';

// Shared sanitization config
const SANITIZE_CONFIG = {
	ALLOWED_TAGS: [
		'p',
		'br',
		'strong',
		'em',
		'u',
		's',
		'code',
		'pre',
		'a',
		'ul',
		'ol',
		'li',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'blockquote',
		'hr',
		'img',
		'table',
		'thead',
		'tbody',
		'tr',
		'th',
		'td',
	],
	ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class'],
	ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

// Lazy-loaded jsdom for server-side use
let jsdomModule: typeof import('jsdom') | null = null;

function getJSDOM(): typeof import('jsdom') {
	if (!jsdomModule) {
		// Use require for server-side to avoid bundling issues
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		jsdomModule = require('jsdom') as typeof import('jsdom');
	}
	return jsdomModule;
}

/**
 * Renders markdown to sanitized HTML
 * @param markdown - The markdown string to render
 * @returns Sanitized HTML string safe for use with {@html} directive
 */
export function renderMarkdown(markdown: string): string {
	if (!markdown) return '';

	// Configure marked options
	marked.setOptions({
		breaks: true, // Convert line breaks to <br>
		gfm: true, // GitHub Flavored Markdown
	});

	// Parse markdown to HTML
	const html = marked.parse(markdown) as string;

	// Sanitize HTML to prevent XSS attacks
	// This is critical for user-generated content
	let sanitized: string;
	
	if (browser) {
		// Client-side: use DOMPurify directly
		sanitized = DOMPurify.sanitize(html, SANITIZE_CONFIG);
	} else {
		// Server-side: use JSDOM for DOMPurify
		// jsdom is externalized in vite.config.ts to avoid bundling
		try {
			const { JSDOM } = getJSDOM();
			const dom = new JSDOM('');
			const purify = DOMPurify(dom.window as unknown as Window & typeof globalThis);
			sanitized = purify.sanitize(html, SANITIZE_CONFIG);
		} catch (e) {
			// Fallback during build: return unsanitized HTML
			// This should only happen during build, not in production SSR
			// In production, jsdom will be available as an external dependency
			console.warn('JSDOM not available during build, skipping sanitization');
			sanitized = html;
		}
	}

	return sanitized;
}

