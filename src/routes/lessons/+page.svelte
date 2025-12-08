<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { LessonRepo } from '../api/lessons/repos/+server';
	import {
		buildCategoryTree,
		getItemsAtPath,
		countLessonsInCategory,
		getSubTreeAtPath,
		getGroupedItemsAtLevel,
		type CategoryTree
	} from '$lib/lessons/utils';
	import CategoryCard from '$lib/components/lessons/CategoryCard.svelte';
	import LessonCard from '$lib/components/lessons/LessonCard.svelte';
	import LessonBreadcrumbs from '$lib/components/lessons/LessonBreadcrumbs.svelte';
	import SearchBar from '$lib/components/lessons/SearchBar.svelte';
	import LessonsSkeleton from '$lib/components/lessons/LessonsSkeleton.svelte';

	let { data }: { data: PageData } = $props();

	let repos = $state<LessonRepo[]>([]);
	let error = $state<string | null>(null);
	let isLoading = $state(true);

	// Load data client-side for immediate skeleton display
	onMount(async () => {
		try {
			isLoading = true;
			const response = await fetch('/api/lessons/repos');
			if (!response.ok) {
				throw new Error(`Failed to fetch lessons: ${response.statusText}`);
			}
			const data = await response.json();
			repos = data;
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load lessons';
			repos = [];
		} finally {
			isLoading = false;
		}
	});

	// Get current path from URL
	const currentPath = $derived.by(() => {
		const pathname = page.url.pathname;
		if (pathname === '/lessons') return [];
		const segments = pathname.replace('/lessons/', '').split('/').filter(Boolean);
		return segments;
	});

	// Build category tree
	const categoryTree = $derived.by(() => {
		if (repos.length === 0) return {};
		return buildCategoryTree(repos);
	});

	// Get items at current path
	const groupedItems = $derived.by(() => {
		return getItemsAtPath(categoryTree, currentPath);
	});

	// Get grouped items by level-2 categories when at level 1 (e.g., /lessons/framework)
	const groupedBySections = $derived.by(() => {
		if (currentPath.length !== 1) return {};
		return getGroupedItemsAtLevel(repos, currentPath);
	});

	// Search state
	let searchQuery = $state('');

	// Filter lessons based on search
	const filteredLessons = $derived.by(() => {
		if (!searchQuery.trim()) {
			return groupedItems.lessons;
		}

		const query = searchQuery.toLowerCase();
		return repos.filter((repo) => {
			const nameMatch = repo.name.toLowerCase().includes(query);
			const descMatch = repo.description?.toLowerCase().includes(query) || false;
			const topicMatch = repo.topics.some((topic) => topic.toLowerCase().includes(query));
			return nameMatch || descMatch || topicMatch;
		});
	});

	// Show search results or normal view
	const showSearchResults = $derived(searchQuery.trim().length > 0);

	function handleSearchInput(value: string) {
		searchQuery = value;
	}

	function navigateToCategory(category: string) {
		const newPath = [...currentPath, category];
		goto(`/lessons/${newPath.join('/')}`);
	}

	function navigateToCategoryInSection(category: string, section: string) {
		const newPath = [...currentPath, section, category];
		goto(`/lessons/${newPath.join('/')}`);
	}

	function navigateToLesson(lesson: LessonRepo) {
		goto(`/lessons/detail/${lesson.name}`);
	}

	function goBack() {
		if (currentPath.length > 0) {
			const parentPath = currentPath.slice(0, -1);
			if (parentPath.length === 0) {
				goto('/lessons');
			} else {
				goto(`/lessons/${parentPath.join('/')}`);
			}
		}
	}
</script>

<div class="lessons-page">
	{#if isLoading}
		<LessonsSkeleton />
	{:else if error}
		<div class="error-state">
			<h1>Error Loading Lessons</h1>
			<p>{error}</p>
			<p class="error-hint">
				Please check that the GITHUB_TOKEN environment variable is set correctly.
			</p>
		</div>
	{:else}
		<div class="lessons-container">
			{#if currentPath.length > 0}
				<button class="back-button" onclick={goBack}>← Back</button>
			{/if}

			<h1 class="page-title">HacKSU Lessons</h1>

			{#if !showSearchResults}
				<p class="subtitle">
					{#if currentPath.length === 0}
						Explore our collection of lessons organized by topic
					{:else}
						Lessons in {currentPath.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')}
					{/if}
				</p>
			{/if}

			<SearchBar value={searchQuery} onInput={handleSearchInput} />

			{#if showSearchResults}
				<div class="search-results">
					<h2 class="results-title">
						{filteredLessons.length} result{filteredLessons.length !== 1 ? 's' : ''} found
					</h2>
					{#if filteredLessons.length === 0}
						<p class="no-results">No lessons found matching "{searchQuery}"</p>
					{:else}
						<div class="lessons-grid">
							{#each filteredLessons as lesson}
								<div onclick={() => navigateToLesson(lesson)}>
									<LessonCard {lesson} />
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				<LessonBreadcrumbs path={currentPath} />

				{#if currentPath.length === 1 && Object.keys(groupedBySections).length > 0}
					<!-- At level 1 (e.g., /lessons/framework): Show level-2 as section headings, level-3 as folders -->
					{#each Object.entries(groupedBySections) as [sectionName, sectionItems]}
						<div class="subcategory-section">
							<h2 class="section-heading">{sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</h2>
							{#if sectionItems.categories.length > 0}
								<div class="categories-grid">
									{#each sectionItems.categories as category}
										{@const subTreePath = [...currentPath, sectionName, category]}
										{@const subTree = getSubTreeAtPath(categoryTree, subTreePath)}
										{@const count = subTree ? countLessonsInCategory(subTree) : 0}
										<div onclick={() => navigateToCategoryInSection(category, sectionName)}>
											<CategoryCard category={category} lessonCount={count} />
										</div>
									{/each}
								</div>
							{/if}
							{#if sectionItems.lessons.length > 0}
								<div class="lessons-grid">
									{#each sectionItems.lessons as lesson}
										<div onclick={() => navigateToLesson(lesson)}>
											<LessonCard {lesson} />
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				{:else if groupedItems.categories.length === 0 && groupedItems.lessons.length === 0}
					<div class="empty-state">
						<p>No lessons found in this category.</p>
					</div>
				{:else if groupedItems.categories.length > 0}
					<div class="categories-grid">
						{#each groupedItems.categories as category}
							{@const subTreePath = [...currentPath, category]}
							{@const subTree = getSubTreeAtPath(categoryTree, subTreePath)}
							{@const count = subTree ? countLessonsInCategory(subTree) : 0}
							<div onclick={() => navigateToCategory(category)}>
								<CategoryCard {category} lessonCount={count} />
							</div>
						{/each}
					</div>
				{:else}
					<div class="lessons-grid">
						{#each groupedItems.lessons as lesson}
							<div onclick={() => navigateToLesson(lesson)}>
								<LessonCard {lesson} />
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.lessons-page {
		background: linear-gradient(to top left, #35c982, #4683ff);
		min-height: 100vh;
		padding: 2rem;
	}

	.lessons-container {
		max-width: 1200px;
		margin: 0 auto;
		position: relative;
	}

	.back-button {
		position: absolute;
		top: 0;
		left: 0;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		color: white;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		backdrop-filter: blur(10px);
		margin-bottom: 1rem;
	}

	.back-button:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateX(-3px);
	}

	.page-title {
		text-align: center;
		color: white;
		font-size: 3rem;
		font-weight: bold;
		margin: 2rem 0 1rem;
	}

	.subtitle {
		text-align: center;
		color: rgba(255, 255, 255, 0.9);
		font-size: 1.25rem;
		margin-bottom: 2rem;
	}

	.subcategory-section {
		margin-top: 3rem;
	}

	.subcategory-section:first-child {
		margin-top: 0;
	}

	.section-heading {
		color: white;
		font-size: 2rem;
		font-weight: bold;
		margin-bottom: 1.5rem;
		text-transform: capitalize;
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.lessons-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.search-results {
		margin-top: 2rem;
	}

	.results-title {
		color: white;
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.no-results {
		color: rgba(255, 255, 255, 0.8);
		font-size: 1.125rem;
		text-align: center;
		padding: 2rem;
	}

	.empty-state {
		text-align: center;
		color: rgba(255, 255, 255, 0.8);
		font-size: 1.125rem;
		padding: 3rem;
	}

	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		color: white;
		text-align: center;
	}

	.error-state h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.error-state p {
		font-size: 1.125rem;
		margin-bottom: 0.5rem;
	}

	.error-hint {
		font-size: 0.875rem;
		opacity: 0.8;
		margin-top: 1rem;
	}

	@media (max-width: 768px) {
		.lessons-page {
			padding: 1rem;
		}

		.page-title {
			font-size: 2rem;
		}

		.categories-grid,
		.lessons-grid {
			grid-template-columns: 1fr;
		}

		.back-button {
			position: relative;
			margin-bottom: 1rem;
		}
	}
</style>

