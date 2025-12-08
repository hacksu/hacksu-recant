/**
 * Iconify icon mapping and utilities
 * Maps technology/framework names to Iconify icon identifiers
 */

// Cache for custom icons from database
let customIconCache: Record<string, string> | null = null;
let cachePromise: Promise<Record<string, string>> | null = null;

/**
 * Fetches custom icons from the database API
 */
async function fetchCustomIcons(): Promise<Record<string, string>> {
	if (customIconCache) {
		return customIconCache;
	}

	if (cachePromise) {
		return cachePromise;
	}

	cachePromise = fetch('/api/lesson-icons')
		.then((res) => res.json())
		.then((data) => {
			customIconCache = data;
			return data;
		})
		.catch((err) => {
			console.warn('Failed to fetch custom icons:', err);
			return {};
		})
		.finally(() => {
			cachePromise = null;
		});

	return cachePromise;
}

// Common technology to Iconify icon mappings (fallback)
const iconMap: Record<string, string> = {
	// Python frameworks
	flask: 'simple-icons:flask',
	django: 'simple-icons:django',
	fastapi: 'simple-icons:fastapi',
	'fast-api': 'simple-icons:fastapi',
	
	// JavaScript frameworks
	react: 'simple-icons:react',
	vue: 'simple-icons:vuedotjs',
	angular: 'simple-icons:angular',
	express: 'simple-icons:express',
	jquery: 'simple-icons:jquery',
	meteor: 'simple-icons:meteor',
	
	// Languages
	python: 'simple-icons:python',
	javascript: 'simple-icons:javascript',
	typescript: 'simple-icons:typescript',
	java: 'simple-icons:java',
	rust: 'simple-icons:rust',
	go: 'simple-icons:go',
	'c++': 'simple-icons:cplusplus',
	c: 'simple-icons:c',
	'c#': 'simple-icons:csharp',
	ruby: 'simple-icons:ruby',
	php: 'simple-icons:php',
	swift: 'simple-icons:swift',
	kotlin: 'simple-icons:kotlin',
	
	// Web technologies
	html: 'simple-icons:html5',
	css: 'simple-icons:css3',
	sass: 'simple-icons:sass',
	less: 'simple-icons:less',
	
	// Databases
	mongodb: 'simple-icons:mongodb',
	postgresql: 'simple-icons:postgresql',
	mysql: 'simple-icons:mysql',
	sqlite: 'simple-icons:sqlite',
	redis: 'simple-icons:redis',
	
	// Tools
	docker: 'simple-icons:docker',
	kubernetes: 'simple-icons:kubernetes',
	git: 'simple-icons:git',
	github: 'simple-icons:github',
	nodejs: 'simple-icons:nodedotjs',
	npm: 'simple-icons:npm',
	yarn: 'simple-icons:yarn',
	
	// Static site generators
	nextjs: 'simple-icons:nextdotjs',
	nuxt: 'simple-icons:nuxtdotjs',
	gatsby: 'simple-icons:gatsby',
	jekyll: 'simple-icons:jekyll',
	hugo: 'simple-icons:hugo',
	
	// Other
	graphql: 'simple-icons:graphql',
	apollo: 'simple-icons:apollographql',
	redux: 'simple-icons:redux',
	webpack: 'simple-icons:webpack',
	vite: 'simple-icons:vite',
};

/**
 * Normalizes a name to match icon map keys
 */
function normalizeName(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Gets the Iconify icon identifier for a given technology name
 * Checks custom database icons first, then falls back to hardcoded map
 */
export async function getIconifyIconAsync(name: string): Promise<string | null> {
	const normalized = normalizeName(name);
	
	// Check custom icons from database first
	const customIcons = await fetchCustomIcons();
	if (customIcons[normalized]) {
		return customIcons[normalized];
	}
	
	// Fallback to hardcoded map
	if (iconMap[normalized]) {
		return iconMap[normalized];
	}
	
	// Try partial matches (e.g., "flask-tutorial" -> "flask")
	for (const [key, icon] of Object.entries(iconMap)) {
		if (normalized.includes(key) || key.includes(normalized)) {
			return icon;
		}
	}
	
	return null;
}

/**
 * Gets the Iconify icon identifier for a given technology name (synchronous version)
 * Uses cached custom icons if available, otherwise falls back to hardcoded map
 */
export function getIconifyIcon(name: string): string | null {
	const normalized = normalizeName(name);
	
	// Check cached custom icons first
	if (customIconCache && customIconCache[normalized]) {
		return customIconCache[normalized];
	}
	
	// Fallback to hardcoded map
	if (iconMap[normalized]) {
		return iconMap[normalized];
	}
	
	// Try partial matches
	for (const [key, icon] of Object.entries(iconMap)) {
		if (normalized.includes(key) || key.includes(normalized)) {
			return icon;
		}
	}
	
	return null;
}

/**
 * Gets the Iconify SVG URL for an icon identifier
 */
export function getIconifyUrl(iconId: string, color?: string): string {
	const [collection, icon] = iconId.split(':');
	const colorParam = color ? `&color=${encodeURIComponent(color)}` : '';
	return `https://api.iconify.design/${collection}/${icon}.svg?width=80&height=80${colorParam}`;
}

/**
 * Gets the icon URL for a technology name, or returns null if not found
 * Uses cached custom icons if available, otherwise falls back to hardcoded map
 */
export function getTechnologyIconUrl(name: string, color?: string): string | null {
	const iconId = getIconifyIcon(name);
	if (!iconId) {
		return null;
	}
	return getIconifyUrl(iconId, color);
}

/**
 * Gets the icon URL for a technology name asynchronously
 * Fetches custom icons from database if not cached
 */
export async function getTechnologyIconUrlAsync(name: string, color?: string): Promise<string | null> {
	const iconId = await getIconifyIconAsync(name);
	if (!iconId) {
		return null;
	}
	return getIconifyUrl(iconId, color);
}


