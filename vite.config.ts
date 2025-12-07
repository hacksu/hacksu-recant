import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
    server: {
        allowedHosts: true
    },
	ssr: {
		noExternal: ['marked', 'dompurify'],
		external: ['jsdom', 'cssstyle', 'nwsapi', 'whatwg-url', 'tr46', 'webidl-conversions']
	},
	optimizeDeps: {
		exclude: ['jsdom', 'cssstyle', 'nwsapi', 'whatwg-url', 'tr46', 'webidl-conversions']
	},
	build: {
		rollupOptions: {
			external: (id) => {
				// Externalize jsdom and its dependencies to avoid bundling issues
				return id === 'jsdom' || id.startsWith('jsdom/') || 
				       id === 'cssstyle' || id.startsWith('cssstyle/') ||
				       id === 'nwsapi' || id === 'whatwg-url' || 
				       id === 'tr46' || id === 'webidl-conversions';
			}
		}
	}
});
