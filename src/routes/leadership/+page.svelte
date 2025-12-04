<script lang="ts">
	import type { PageData } from './$types';
	import favicon from '$lib/assets/favicon.svg';

	let { data }: { data: PageData } = $props();

	const currentLeaders = $derived(data.currentLeaders);
	const leadersByTerm = $derived(data.leadersByTerm);
	const sortedTerms = $derived(data.sortedTerms);

	function getPhotoUrl(leader: typeof data.currentLeaders[0]): string {
		if (leader.photo) {
			return leader.photo;
		}
		if (leader.github) {
			return `https://github.com/${leader.github}.png`;
		}
		return favicon;
	}

	function handleImageError(event: Event) {
		const target = event.target as HTMLImageElement;
		target.src = favicon;
	}
</script>

<div class="min-h-screen bg-white dark:bg-gray-900">
	<div class="container mx-auto px-4 py-12 max-w-7xl">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
				Leaders & Alumni
			</h1>
			<p class="text-xl text-gray-600 dark:text-gray-400">
				Present & Past Leadership of HacKSU
			</p>
		</div>

		<!-- Current Leadership -->
		{#if currentLeaders.length > 0}
			<div class="mb-16">
				<h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
					Current Leadership
				</h2>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
					{#each currentLeaders as leader}
						<div class="flex flex-col items-center text-center">
							<img
								src={getPhotoUrl(leader)}
								alt={leader.name}
								class="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-200 dark:border-gray-700"
								onerror={handleImageError}
							/>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								{leader.name}
							</h3>
							<div class="flex flex-col gap-1">
								{#each leader.titles as title}
									<span class="text-sm text-gray-600 dark:text-gray-400">{title}</span>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Past Leadership by Term -->
		{#if sortedTerms.length > 0}
			<div>
				{#each sortedTerms as term}
					<div class="mb-12">
						<h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
							{term}
						</h2>
						<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
							{#each leadersByTerm[term] as leader}
								<div class="flex flex-col items-center text-center">
									<img
										src={getPhotoUrl(leader)}
										alt={leader.name}
										class="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-200 dark:border-gray-700"
										onerror={handleImageError}
									/>
									<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
										{leader.name}
									</h3>
									<div class="flex flex-col gap-1">
										{#each leader.titles as title}
											<span class="text-sm text-gray-600 dark:text-gray-400">{title}</span>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Empty State -->
		{#if currentLeaders.length === 0 && sortedTerms.length === 0}
			<div class="text-center py-12">
				<p class="text-gray-600 dark:text-gray-400">No leadership information available yet.</p>
			</div>
		{/if}
	</div>
</div>