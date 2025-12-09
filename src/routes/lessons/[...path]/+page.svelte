<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { LessonRepo } from '../../api/lessons/repos/+server';
	import {
		buildCategoryTree,
		getItemsAtPath,
		countLessonsInCategory,
		getSubTreeAtPath,
		getLessonsBySubcategory,
		getGroupedItemsAtLevel,
		type CategoryTree
	} from '$lib/lessons/utils';
	import CategoryCard from '$lib/components/lessons/CategoryCard.svelte';
	import LessonCard from '$lib/components/lessons/LessonCard.svelte';
	import LessonBreadcrumbs from '$lib/components/lessons/LessonBreadcrumbs.svelte';
	import SearchBar from '$lib/components/lessons/SearchBar.svelte';
	import LessonsSkeleton from '$lib/components/lessons/LessonsSkeleton.svelte';

	let { data, params }: { data: PageData; params: { path?: string } } = $props();

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

	// Get current path from URL params
	const currentPath = $derived.by(() => {
		if (!params.path) return [];
		return params.path.split('/').filter(Boolean);
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

	// Get lessons grouped by subcategory (for section headings display)
	const lessonsBySubcategory = $derived.by(() => {
		return getLessonsBySubcategory(categoryTree, currentPath);
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

<div class="bg-gradient-to-tl from-[#35c982] to-[#4683ff] min-h-screen p-8 md:p-4">
	{#if isLoading}
		<LessonsSkeleton />
	{:else if error}
		<div class="flex flex-col items-center justify-center min-h-[60vh] text-white text-center">
			<h1 class="text-3xl mb-4">Error Loading Lessons</h1>
			<p class="text-lg mb-2">{error}</p>
			<p class="text-sm opacity-80 mt-4">
				Please check that the GITHUB_TOKEN environment variable is set correctly.
			</p>
		</div>
	{:else}
		<div class="max-w-[1200px] mx-auto relative">
			{#if currentPath.length > 0}
				<button
					class="absolute top-0 left-0 md:relative md:mb-4 bg-white/10 border border-white/20 rounded-lg px-6 py-3 text-white text-base cursor-pointer transition-all duration-200 backdrop-blur-md mb-4 hover:bg-white/20 hover:-translate-x-1"
					onclick={goBack}
				>
					← Back
				</button>
			{/if}

			<h1 class="text-center text-white text-5xl md:text-3xl font-bold my-8">HacKSU Lessons</h1>

			{#if !showSearchResults}
				<p class="text-center text-white/90 text-xl mb-8">
					{#if currentPath.length === 0}
						Explore our collection of lessons organized by topic
					{:else}
						Lessons in {currentPath.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')}
					{/if}
				</p>
			{/if}

			<SearchBar value={searchQuery} onInput={handleSearchInput} />

			{#if showSearchResults}
				<div class="mt-8">
					<h2 class="text-white text-2xl mb-4">
						{filteredLessons.length} result{filteredLessons.length !== 1 ? 's' : ''} found
					</h2>
					{#if filteredLessons.length === 0}
						<p class="text-white/80 text-lg text-center py-8">No lessons found matching "{searchQuery}"</p>
					{:else}
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 max-w-[1200px]">
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
						<div class="mt-12 first:mt-0">
							<h2 class="text-white text-3xl font-bold mb-6 capitalize">
								{sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}
							</h2>
							{#if sectionItems.categories.length > 0}
								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
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
								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 max-w-[1200px]">
									{#each sectionItems.lessons as lesson}
										<div onclick={() => navigateToLesson(lesson)}>
											<LessonCard {lesson} />
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				{:else if groupedItems.categories.length === 0 && groupedItems.lessons.length === 0 && lessonsBySubcategory.directLessons.length === 0 && lessonsBySubcategory.subcategoryGroups.length === 0}
					<div class="text-center text-white/80 text-lg py-12">No lessons found in this category.</div>
				{:else if lessonsBySubcategory.subcategoryGroups.length > 0 || lessonsBySubcategory.directLessons.length > 0}
					<!-- Show section headings with grouped lessons -->
					{#if lessonsBySubcategory.directLessons.length > 0}
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 max-w-[1200px]">
							{#each lessonsBySubcategory.directLessons as lesson}
								<div onclick={() => navigateToLesson(lesson)}>
									<LessonCard {lesson} />
								</div>
							{/each}
						</div>
					{/if}

					{#each lessonsBySubcategory.subcategoryGroups as group}
						<div class="mt-12 first:mt-0">
							<h2 class="text-white text-3xl font-bold mb-2 capitalize">
								{group.name.charAt(0).toUpperCase() + group.name.slice(1)}
							</h2>
							<div class="h-px bg-white/30 mb-6"></div>
							<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] md:grid-cols-1 gap-6 max-w-[1200px]">
								{#each group.lessons as lesson}
									<div onclick={() => navigateToLesson(lesson)}>
										<LessonCard {lesson} />
									</div>
								{/each}
							</div>
						</div>
					{/each}
				{:else if groupedItems.categories.length > 0}
					<!-- Show category cards if no subcategory grouping needed -->
					<div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] md:grid-cols-1 gap-6 mt-8">
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
					<!-- Show lessons directly if no categories -->
					<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] md:grid-cols-1 gap-6 mt-8 max-w-[1200px]">
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

