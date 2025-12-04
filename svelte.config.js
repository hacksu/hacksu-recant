import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		csrf: {
			trustedOrigins: ['*'] // Allow all origins - useful when running behind a proxy or in Docker (eventaually I need to make this correct with hacksu.com and dev.hacksu.com)
		},
	}
};

export default config;
