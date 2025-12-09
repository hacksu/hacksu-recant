import type { LessonRepo } from '@routes/api/lessons/repos/+server';

export interface ParsedTopic {
	name: string;
	level: number;
	chain: string; // branch letter or '_default'
}

export interface CategoryTree {
	[key: string]: CategoryTree | LessonRepo[];
}

export interface GroupedItems {
	categories: string[];
	lessons: LessonRepo[];
}

export interface SubcategoryGroup {
	name: string;
	lessons: LessonRepo[];
}

/**
 * Parses a topic tag in the format: {categoryName}-{level}{branch?}
 * Examples: "framework-1", "javascript-2a", "express-3a"
 */
export function parseTopic(tag: string): ParsedTopic | null {
	const match = tag.match(/^(.+)-(\d+)([a-z])?$/);
	if (!match) {
		return null;
	}

	const [, name, levelStr, branch] = match;
	const level = parseInt(levelStr, 10);
	const chain = branch || '_default';

	return { name, level, chain };
}

/**
 * Builds a nested category tree from lesson repos based on their topics
 * Supports ordered, branched topic convention: {categoryName}-{level}{branch?}
 * 
 * Examples:
 * - "framework-1", "javascript-2a", "express-3a" → path: ["framework", "javascript", "express"]
 * - "framework-1b", "python-2b", "flask-3b" → path: ["framework", "python", "flask"]
 * 
 * Branches (a, b, _default) allow parallel category trees. Topics are grouped by branch,
 * sorted by level, and paths are built accordingly. Lessons can appear in multiple branches
 * if they have topics from different chains.
 */
export function buildCategoryTree(repos: LessonRepo[]): CategoryTree {
	const tree: CategoryTree = {};

	for (const repo of repos) {
		// Use only numbered topics to build hierarchy (e.g., framework-1, javascript-2, angular-3)
		const topicsByChain: Record<string, ParsedTopic[]> = {};
		for (const topic of repo.topics) {
			if (topic === 'lesson') continue;
			const parsed = parseTopic(topic);
			if (!parsed) continue;
			if (!topicsByChain[parsed.chain]) topicsByChain[parsed.chain] = [];
			topicsByChain[parsed.chain].push(parsed);
		}

		// Skip repos without numbered topics (cannot place in hierarchy)
		if (Object.keys(topicsByChain).length === 0) continue;

		for (const topics of Object.values(topicsByChain)) {
			// Sort by level to determine path order
			topics.sort((a, b) => a.level - b.level);

			const path = topics.map((t) => t.name);
			let current = tree;
			for (const segment of path) {
				if (!current[segment]) current[segment] = {};
				current = current[segment] as CategoryTree;
			}

			if (!Array.isArray(current)) {
				if (!current['__lessons__']) current['__lessons__'] = [];
				const lessons = current['__lessons__'] as LessonRepo[];
				if (!lessons.find((l) => l.id === repo.id)) lessons.push(repo);
			}
		}
	}

	return tree;
}

/**
 * Gets items at a specific path in the category tree
 */
export function getItemsAtPath(tree: CategoryTree, path: string[]): GroupedItems {
	let current: CategoryTree | LessonRepo[] = tree;

	// Navigate to the path
	for (const segment of path) {
		if (typeof current === 'object' && !Array.isArray(current) && current[segment]) {
			current = current[segment] as CategoryTree | LessonRepo[];
		} else {
			// Path doesn't exist
			return { categories: [], lessons: [] };
		}
	}

	// If we're at a lessons array, return it
	if (Array.isArray(current)) {
		return { categories: [], lessons: current };
	}

	// Extract categories and lessons from current level
	const categories: string[] = [];
	const lessons: LessonRepo[] = [];

	for (const [key, value] of Object.entries(current)) {
		if (key === '__lessons__' && Array.isArray(value)) {
			lessons.push(...value);
		} else if (typeof value === 'object' && !Array.isArray(value)) {
			categories.push(key);
		}
	}

	return { categories, lessons };
}

/**
 * Gets items grouped by level-2 categories when at level 1
 * Returns: { [level2Category]: { categories: string[], lessons: LessonRepo[] } }
 */
export function getGroupedItemsAtLevel(repos: LessonRepo[], path: string[]): Record<string, GroupedItems> {
	const grouped: Record<string, GroupedItems> = {};
	const targetLevel = path.length + 1; // The level we're looking at

	for (const repo of repos) {
		// Parse topics and find matching path
		const topicsByChain: Record<string, ParsedTopic[]> = {};
		for (const topic of repo.topics) {
			if (topic === 'lesson') continue;
			const parsed = parseTopic(topic);
			if (!parsed) continue;
			if (!topicsByChain[parsed.chain]) topicsByChain[parsed.chain] = [];
			topicsByChain[parsed.chain].push(parsed);
		}

		// Check each chain to see if it matches the current path
		for (const topics of Object.values(topicsByChain)) {
			topics.sort((a, b) => a.level - b.level);
			const topicPath = topics.map((t) => t.name);

			// Check if this chain matches the current path
			const matchesPath = path.every((segment, index) => {
				return topicPath[index]?.toLowerCase() === segment.toLowerCase();
			});

			if (matchesPath && topicPath.length >= targetLevel) {
				// Get the level-2 category (or level-3 if we're at level 2, etc.)
				const groupKey = topicPath[targetLevel - 1];
				if (!groupKey) continue;

				if (!grouped[groupKey]) {
					grouped[groupKey] = { categories: [], lessons: [] };
				}

				// If there's a next level category, add it to categories
				if (topicPath.length > targetLevel) {
					const nextCategory = topicPath[targetLevel];
					if (!grouped[groupKey].categories.includes(nextCategory)) {
						grouped[groupKey].categories.push(nextCategory);
					}
				} else {
					// This is a lesson at this level
					if (!grouped[groupKey].lessons.find((l) => l.id === repo.id)) {
						grouped[groupKey].lessons.push(repo);
					}
				}
			}
		}
	}

	// Sort categories within each group
	for (const group of Object.values(grouped)) {
		group.categories.sort();
	}

	return grouped;
}

/**
 * Gets the subtree at a specific path
 */
export function getSubTreeAtPath(tree: CategoryTree, path: string[]): CategoryTree | null {
	let current: CategoryTree | LessonRepo[] = tree;

	for (const segment of path) {
		if (typeof current === 'object' && !Array.isArray(current) && current[segment]) {
			current = current[segment] as CategoryTree | LessonRepo[];
		} else {
			return null;
		}
	}

	if (Array.isArray(current)) {
		return null;
	}

	return current as CategoryTree;
}

/**
 * Gets lessons grouped by their immediate subcategories
 * Used when viewing a category to show section headings with lessons grouped underneath
 */
export function getLessonsBySubcategory(tree: CategoryTree, path: string[]): {
	directLessons: LessonRepo[];
	subcategoryGroups: SubcategoryGroup[];
} {
	const directLessons: LessonRepo[] = [];
	const subcategoryGroups: SubcategoryGroup[] = [];

	// Navigate to the path
	let current: CategoryTree | LessonRepo[] = tree;
	for (const segment of path) {
		if (typeof current === 'object' && !Array.isArray(current) && current[segment]) {
			current = current[segment] as CategoryTree | LessonRepo[];
		} else {
			return { directLessons: [], subcategoryGroups: [] };
		}
	}

	if (Array.isArray(current)) {
		return { directLessons: current, subcategoryGroups: [] };
	}

	// Get direct lessons at this level
	if (current['__lessons__'] && Array.isArray(current['__lessons__'])) {
		directLessons.push(...current['__lessons__']);
	}

	// For each subcategory, collect all lessons from level 3 and below
	for (const [categoryName, subTree] of Object.entries(current)) {
		if (categoryName === '__lessons__' || Array.isArray(subTree)) {
			continue;
		}

		const lessons: LessonRepo[] = [];
		
		// Recursively collect all lessons from this subcategory
		function collectLessons(node: CategoryTree | LessonRepo[]): void {
			if (Array.isArray(node)) {
				lessons.push(...node);
			} else {
				if (node['__lessons__'] && Array.isArray(node['__lessons__'])) {
					lessons.push(...node['__lessons__']);
				}
				for (const [key, value] of Object.entries(node)) {
					if (key !== '__lessons__' && typeof value === 'object' && !Array.isArray(value)) {
						collectLessons(value);
					}
				}
			}
		}

		collectLessons(subTree);

		// Remove duplicates
		const uniqueLessons = Array.from(new Map(lessons.map((l) => [l.id, l])).values());

		if (uniqueLessons.length > 0) {
			subcategoryGroups.push({
				name: categoryName,
				lessons: uniqueLessons
			});
		}
	}

	// Sort subcategory groups alphabetically
	subcategoryGroups.sort((a, b) => a.name.localeCompare(b.name));

	return { directLessons, subcategoryGroups };
}

/**
 * Counts the total number of lessons in a category (recursively)
 */
export function countLessonsInCategory(tree: CategoryTree | LessonRepo[]): number {
	if (Array.isArray(tree)) {
		return tree.length;
	}

	// Count all lessons in this tree
	let count = 0;
	if (tree['__lessons__'] && Array.isArray(tree['__lessons__'])) {
		count += tree['__lessons__'].length;
	}

	for (const [key, value] of Object.entries(tree)) {
		if (key !== '__lessons__' && typeof value === 'object' && !Array.isArray(value)) {
			count += countLessonsInCategory(value);
		}
	}

	return count;
}

/**
 * Formats a date as "X time ago"
 */
export function formatTimeAgo(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);
	const diffWeeks = Math.floor(diffDays / 7);
	const diffMonths = Math.floor(diffDays / 30);
	const diffYears = Math.floor(diffDays / 365);

	if (diffSecs < 60) return 'just now';
	if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
	if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
	if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
	return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}

/**
 * Gets language color (basic mapping)
 */
export function getLanguageColor(language: string | null): string {
	if (!language) return '#6b7280';

	const colors: Record<string, string> = {
		JavaScript: '#f7df1e',
		TypeScript: '#3178c6',
		Python: '#3776ab',
		Java: '#ed8b00',
		'C++': '#00599c',
		C: '#a8b9cc',
		Rust: '#000000',
		Go: '#00add8',
		Ruby: '#cc342d',
		PHP: '#777bb4',
		Swift: '#fa7343',
		Kotlin: '#7f52ff',
		HTML: '#e34c26',
		CSS: '#1572b6',
		Shell: '#89e051',
		'C#': '#239120'
	};

	return colors[language] || '#6b7280';
}
